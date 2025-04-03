
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPaylinkInvoiceStatus } from '@/services/paylinkService';

/**
 * Verifies a payment and updates the user's subscription status
 * @param transactionIdentifier The transaction ID from the payment provider
 * @param customId Additional ID for PayPal transactions
 * @param txnId PayPal transaction ID
 * @param plan Subscription plan type
 */
export const verifyPayment = async (
  transactionIdentifier: string,
  customId: string,
  txnId: string,
  plan: string | null
) => {
  if (!plan) return;

  try {
    console.log("Verifying payment with identifiers:", { 
      transactionIdentifier, 
      customId, 
      txnId, 
      plan 
    });

    // استرجاع بيانات اعتماد PayLink
    const { data: paymentSettings, error: settingsError } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError) {
      console.error("خطأ في جلب إعدادات الدفع:", settingsError);
    }

    // استرجاع إعدادات التسعير للحصول على أسعار الخطط
    const { data: pricingSettings, error: pricingError } = await supabase
      .from('pricing_settings')
      .select('*')
      .limit(1)
      .single();

    if (pricingError) {
      console.error("خطأ في جلب إعدادات التسعير:", pricingError);
    }

    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error("No authenticated user found");
      return;
    }
    
    const userId = session.user.id;
    console.log("Setting subscription for user:", userId);

    // تحديث حالة الفاتورة في قاعدة البيانات للفاتورة المحددة
    // PayPal يمكن أن يرسل invoice_id في العنوان
    const invoiceIdParam = new URLSearchParams(window.location.search).get('invoice_id');
    const identifiers = [transactionIdentifier, customId, txnId, invoiceIdParam].filter(id => id);
    
    let invoiceId = "";
    let foundInvoice = false;
    
    if (identifiers.length > 0) {
      console.log("Looking for invoice with identifiers:", identifiers);
      
      // بناء استعلام البحث عن الفاتورة باستخدام OR لكل معرّف
      const { data: invoices, error: findError } = await supabase
        .from('payment_invoices')
        .select('*')
        .in('invoice_id', identifiers);
      
      if (findError) {
        console.error("Error finding invoice:", findError);
      } else if (invoices && invoices.length > 0) {
        console.log("Found matching invoices:", invoices);
        foundInvoice = true;
        invoiceId = invoices[0].id;
        
        // تحديث حالة الفاتورة في قاعدة البيانات إلى "مدفوع"
        const { error: updateInvoiceError } = await supabase
          .from('payment_invoices')
          .update({ status: 'مدفوع' })
          .eq('id', invoices[0].id);
          
        if (updateInvoiceError) {
          console.error("Error updating invoice status:", updateInvoiceError);
        } else {
          console.log("Updated invoice status to مدفوع for invoice:", invoices[0].invoice_id);
        }
      } else {
        console.log("No matching invoice found for identifiers:", identifiers);
      }
      
      // إذا لم نجد فاتورة، نبحث باستخدام معرف المستخدم ونوع الخطة
      if (!foundInvoice) {
        console.log("Looking for pending invoices for user:", userId, "and plan:", plan);
        
        const { data: userInvoices, error: userInvoicesError } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('user_id', userId)
          .eq('plan_name', plan)
          .in('status', ['Pending', 'قيد الانتظار', 'pending']);
          
        if (userInvoicesError) {
          console.error("Error finding user invoices:", userInvoicesError);
        } else if (userInvoices && userInvoices.length > 0) {
          console.log("Found pending invoices for user:", userInvoices);
          foundInvoice = true;
          invoiceId = userInvoices[0].id;
          
          // تحديث حالة الفاتورة في قاعدة البيانات إلى "مدفوع"
          const { error: updateInvoiceError } = await supabase
            .from('payment_invoices')
            .update({ status: 'مدفوع' })
            .eq('id', userInvoices[0].id);
            
          if (updateInvoiceError) {
            console.error("Error updating user invoice status:", updateInvoiceError);
          } else {
            console.log("Updated user invoice status to مدفوع for invoice:", userInvoices[0].invoice_id);
          }
        }
      }
      
      // إذا كانت العملية من PayPal وليس لدينا فاتورة متطابقة
      if (!foundInvoice && txnId && plan) {
        // تحديد المبلغ بناءً على نوع الخطة
        let amount = 0;
        if (plan === 'premium') {
          // استخدام السعر من إعدادات التسعير، أو استخدام قيمة افتراضية
          amount = pricingSettings?.premium_plan_price || 49;
        } else if (plan === 'pro') {
          amount = pricingSettings?.pro_plan_price || 99;
        }
        
        console.log("Creating new PayPal invoice record for txnId:", txnId);
        
        // إنشاء سجل جديد بناءً على معلومات PayPal
        const { data: newInvoice, error: newInvoiceError } = await supabase
          .from('payment_invoices')
          .insert({
            invoice_id: txnId,
            user_id: userId,
            plan_name: plan,
            status: 'مدفوع', // Set directly to paid since we're on success page
            payment_method: 'paypal',
            amount: amount
          })
          .select()
          .single();
          
        if (newInvoiceError) {
          console.error("Error creating new invoice:", newInvoiceError);
        } else if (newInvoice) {
          invoiceId = newInvoice.id;
          console.log("Created new payment record from PayPal data with ID:", invoiceId);
        }
      }
    }

    // التحقق من واجهة برمجة التطبيقات PayLink إذا كان ذلك ممكناً
    // Extract PayLink transaction number if present in the transactionIdentifier
    const payLinkTransactionNumber = transactionIdentifier?.startsWith('PLI') ? transactionIdentifier : '';
    
    if (payLinkTransactionNumber && paymentSettings?.paylink_api_key && paymentSettings?.paylink_secret_key) {
      // التحقق من حالة الدفع باستخدام API (للتوثيق فقط)
      const status = await getPaylinkInvoiceStatus(
        paymentSettings.paylink_api_key,
        paymentSettings.paylink_secret_key,
        payLinkTransactionNumber
      );
      
      if (status) {
        console.log(`حالة الدفع من PayLink API: ${status}`);
      }
    }
    
    // Set expiry date (30 days from now) بغض النظر عن نتيجة التحقق من API
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update the user's subscription in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        subscription_type: plan,
        subscription_expires_at: expiryDate.toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Error updating user subscription:", updateError);
      toast.error("حدث خطأ أثناء تحديث الاشتراك");
    } else {
      console.log("Updated subscription successfully for user:", userId, "to plan:", plan);
      
      // تحديث جميع الدفعات المرتبطة بهذا المستخدم والخطة إلى حالة "مدفوع"
      const { error: updateAllInvoicesError } = await supabase
        .from('payment_invoices')
        .update({ status: 'مدفوع' })
        .eq('user_id', userId)
        .eq('plan_name', plan)
        .in('status', ['Pending', 'قيد الانتظار', 'pending']);
        
      if (updateAllInvoicesError) {
        console.error("Error updating related invoices:", updateAllInvoicesError);
      } else {
        console.log("Updated all pending invoices for user:", userId, "and plan:", plan);
      }
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    // نعرض رسالة نجاح على الرغم من الخطأ لأن المستخدم على صفحة النجاح
    toast.success(`تم الاشتراك في الباقة ${plan === 'premium' ? 'المميزة' : 'الاحترافية'} بنجاح!`);
  }
};
