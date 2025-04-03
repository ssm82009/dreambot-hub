
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyPayment } from '@/utils/payment/verifyPayment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // PayLink params
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  
  // PayPal params
  const invoiceId = searchParams.get('invoice_id') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const token = searchParams.get('token') || '';
  const customId = searchParams.get('custom') || ''; // PayPal custom field (contains our invoiceId)
  const txnId = searchParams.get('tx') || ''; // PayPal transaction ID
  const payerID = searchParams.get('PayerID') || ''; // PayPal payer ID
  
  // Get any available transaction identifier
  const transactionIdentifier = invoiceId || transactionNo || orderNumber || customId || token || paymentId || txnId;
  
  useEffect(() => {
    const handleVerification = async () => {
      try {
        setIsVerifying(true);
        
        // Log all search parameters for debugging
        console.log("Payment verification search params:", Object.fromEntries(searchParams.entries()));
        console.log("Detected transaction identifier:", transactionIdentifier);
        
        // Check if we're on the success page with a transaction identifier
        if (transactionIdentifier) {
          // تحديث حالة الاشتراك في localStorage
          const plan = localStorage.getItem('pendingSubscriptionPlan');
          if (plan) {
            localStorage.setItem('subscriptionType', plan);
            localStorage.removeItem('pendingSubscriptionPlan');
            
            // تسجيل معرّف العملية في سجل المطور
            console.log("Payment success with transaction ID:", transactionIdentifier);
            
            // Get current user ID for more specific queries
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            
            if (userId) {
              console.log("Updating payment records for user:", userId);
              
              // طريقة 1: البحث باستخدام معرف المعاملة
              const { data: invoicesByID, error: invoiceIDError } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', transactionIdentifier);
                
              if (invoiceIDError) {
                console.error("Error searching for invoice by ID:", invoiceIDError);
              } else if (invoicesByID && invoicesByID.length > 0) {
                console.log("Found invoices by transaction ID:", invoicesByID);
                
                // تحديث جميع الفواتير المطابقة
                for (const invoice of invoicesByID) {
                  if (invoice.status !== 'مدفوع') {
                    const { error: updateError } = await supabase
                      .from('payment_invoices')
                      .update({ status: 'مدفوع' })
                      .eq('id', invoice.id);
                      
                    if (updateError) {
                      console.error("Error updating invoice by ID:", updateError);
                    } else {
                      console.log("Successfully updated invoice:", invoice.id);
                    }
                  }
                }
              } else {
                console.log("No invoices found by transaction ID, trying user ID");
              }
              
              // طريقة 2: البحث باستخدام معرف المستخدم والخطة
              // هذا يساعد في حالة عدم تخزين transactionIdentifier بشكل صحيح
              if (plan) {
                const { data: invoicesByUser, error: userInvoiceError } = await supabase
                  .from('payment_invoices')
                  .select('*')
                  .eq('user_id', userId)
                  .eq('plan_name', plan)
                  .in('status', ['Pending', 'قيد الانتظار', 'pending'])
                  .order('created_at', { ascending: false });
                  
                if (userInvoiceError) {
                  console.error("Error searching for invoice by user:", userInvoiceError);
                } else if (invoicesByUser && invoicesByUser.length > 0) {
                  console.log("Found invoices by user and plan:", invoicesByUser);
                  
                  // تحديث جميع الفواتير المعلقة
                  for (const invoice of invoicesByUser) {
                    const { error: updateError } = await supabase
                      .from('payment_invoices')
                      .update({ status: 'مدفوع' })
                      .eq('id', invoice.id);
                      
                    if (updateError) {
                      console.error("Error updating invoice by user:", updateError);
                    } else {
                      console.log("Successfully updated invoice:", invoice.id);
                    }
                  }
                } else {
                  console.log("No pending invoices found by user and plan");
                  
                  // إذا لم نجد أي فاتورة معلقة، تحقق من آخر الفواتير المضافة للمستخدم
                  const { data: recentInvoices, error: recentError } = await supabase
                    .from('payment_invoices')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1);
                    
                  if (recentError) {
                    console.error("Error fetching recent invoices:", recentError);
                  } else if (recentInvoices && recentInvoices.length > 0) {
                    const recentInvoice = recentInvoices[0];
                    console.log("Found most recent invoice:", recentInvoice);
                    
                    // تحديث الفاتورة الأخيرة إذا لم تكن مدفوعة
                    if (recentInvoice.status !== 'مدفوع') {
                      const { error: updateError } = await supabase
                        .from('payment_invoices')
                        .update({ status: 'مدفوع' })
                        .eq('id', recentInvoice.id);
                        
                      if (updateError) {
                        console.error("Error updating recent invoice:", updateError);
                      } else {
                        console.log("Successfully updated recent invoice:", recentInvoice.id);
                      }
                    }
                  }
                }
              }
              
              // طريقة 3: إنشاء فاتورة جديدة إذا لم يتم العثور على أي فاتورة
              // هذا يمكن أن يحدث في بعض الحالات النادرة
              if (plan && (!invoicesByID || invoicesByID.length === 0)) {
                const { data: existingCheck, error: existingError } = await supabase
                  .from('payment_invoices')
                  .select('count')
                  .eq('user_id', userId)
                  .eq('invoice_id', transactionIdentifier);
                  
                if (!existingError && (!existingCheck || existingCheck.length === 0)) {
                  // الحصول على سعر الخطة
                  const { data: pricingSettings } = await supabase
                    .from('pricing_settings')
                    .select('*')
                    .limit(1)
                    .single();
                    
                  let amount = 0;
                  if (plan === 'premium') {
                    amount = pricingSettings?.premium_plan_price || 49;
                  } else if (plan === 'pro') {
                    amount = pricingSettings?.pro_plan_price || 99;
                  }
                  
                  // إنشاء فاتورة جديدة
                  const { error: insertError } = await supabase
                    .from('payment_invoices')
                    .insert({
                      invoice_id: transactionIdentifier,
                      user_id: userId,
                      plan_name: plan,
                      status: 'مدفوع',
                      payment_method: token ? 'paypal' : 'paylink',
                      amount: amount
                    });
                    
                  if (insertError) {
                    console.error("Error creating new invoice:", insertError);
                  } else {
                    console.log("Created new invoice with ID:", transactionIdentifier);
                  }
                }
              }
            }
            
            // Verify the payment in the database and update invoice status to "Paid"
            await verifyPayment(transactionIdentifier, customId, txnId, plan);
            
            // إظهار رسالة نجاح للمستخدم
            const planName = plan === 'premium' ? 'المميزة' : 'الاحترافية';
            toast.success(`تم الاشتراك في الباقة ${planName} بنجاح!`);
          } else {
            console.log("No pending subscription plan found in localStorage");
          }
        } else {
          console.log("No transaction identifier found in URL");
        }
      } catch (error) {
        console.error("Error in payment verification:", error);
        toast.error("حدث خطأ في التحقق من الدفع. يرجى الاتصال بالدعم الفني.");
      } finally {
        setIsVerifying(false);
      }
    };

    if (transactionIdentifier) {
      handleVerification();
    } else {
      setIsVerifying(false);
    }
  }, [transactionIdentifier, customId, txnId, searchParams, payerID]);

  return { transactionIdentifier, isVerifying };
};
