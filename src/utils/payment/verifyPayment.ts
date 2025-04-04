
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { findInvoiceByIdentifiers, findPendingInvoiceByUserPlan, createPayPalInvoiceRecord, updateAllPendingInvoices } from './invoiceManager';
import { updateUserSubscription } from './subscriptionUpdater';
import { verifyPaylinkPayment } from './paylinkVerifier';
import { normalizePaymentStatus, PAYMENT_STATUS } from './statusNormalizer';

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

    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error("No authenticated user found");
      return;
    }
    
    const userId = session.user.id;
    console.log("Setting subscription for user:", userId);

    // تحديث حالة الفاتورة في قاعدة البيانات للفاتورة المحددة
    const identifiers = [transactionIdentifier, customId, txnId].filter(id => id);
    
    let invoiceId = "";
    let foundInvoice = false;
    
    if (identifiers.length > 0) {
      // بحث عن الفاتورة باستخدام المعرفات
      const result = await findInvoiceByIdentifiers(identifiers);
      invoiceId = result.invoiceId;
      foundInvoice = result.foundInvoice;
      
      // إذا لم نجد فاتورة، نبحث باستخدام معرف المستخدم ونوع الخطة
      if (!foundInvoice) {
        const userPlanResult = await findPendingInvoiceByUserPlan(userId, plan);
        invoiceId = userPlanResult.invoiceId;
        foundInvoice = userPlanResult.foundInvoice;
      }
      
      // إذا كانت العملية من PayPal وليس لدينا فاتورة متطابقة
      if (!foundInvoice && txnId && plan) {
        // استرجاع إعدادات التسعير للحصول على أسعار الخطط
        const { data: pricingSettings, error: pricingError } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();

        if (pricingError) {
          console.error("خطأ في جلب إعدادات التسعير:", pricingError);
        }
        
        invoiceId = await createPayPalInvoiceRecord(txnId, userId, plan, pricingSettings);
      }
    }

    // التحقق من واجهة برمجة التطبيقات PayLink إذا كان ذلك ممكناً
    // Extract PayLink transaction number if present in the transactionIdentifier
    const payLinkTransactionNumber = transactionIdentifier?.startsWith('PLI') ? transactionIdentifier : '';
    
    if (payLinkTransactionNumber && paymentSettings?.paylink_api_key && paymentSettings?.paylink_secret_key) {
      await verifyPaylinkPayment(
        payLinkTransactionNumber,
        paymentSettings.paylink_api_key,
        paymentSettings.paylink_secret_key
      );
    }
    
    // Update the user's subscription
    const subscriptionUpdated = await updateUserSubscription(userId, plan);
    
    if (subscriptionUpdated) {
      // تحديث جميع الدفعات المرتبطة بهذا المستخدم والخطة إلى حالة "مدفوع"
      await updateAllPendingInvoices(userId, plan);
      
      // وأيضاً تحديث المدفوعات الأخرى التي تحمل نفس المعرّفات
      if (identifiers.length > 0) {
        for (const identifier of identifiers) {
          if (identifier) {
            const { error: updateError } = await supabase
              .from('payment_invoices')
              .update({ 
                status: PAYMENT_STATUS.PAID,
                expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
              })
              .eq('invoice_id', identifier);
              
            if (updateError) {
              console.error(`خطأ في تحديث حالة الفاتورة ${identifier}:`, updateError);
            } else {
              console.log(`تم تحديث حالة الفاتورة ${identifier} إلى مدفوع`);
            }
          }
        }
      }
    }
    
    return subscriptionUpdated;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};
