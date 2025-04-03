
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
  
  // Get any available transaction identifier
  const transactionIdentifier = transactionNo || orderNumber || invoiceId || customId || token || paymentId || txnId;
  
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
            
            // Check if the payment record already exists and update its status
            const { data: existingPayments, error: checkError } = await supabase
              .from('payment_invoices')
              .select('*')
              .eq('invoice_id', transactionIdentifier);
              
            if (!checkError && existingPayments && existingPayments.length > 0) {
              const payment = existingPayments[0];
              
              // If payment is still pending, update it
              if (payment.status === 'Pending' || payment.status === 'قيد الانتظار' || payment.status === 'pending') {
                console.log("Found pending payment record. Updating to paid:", payment);
                
                const { error: updateError } = await supabase
                  .from('payment_invoices')
                  .update({ status: 'مدفوع' })
                  .eq('id', payment.id);
                  
                if (updateError) {
                  console.error("Error updating payment status:", updateError);
                } else {
                  console.log("Updated payment status to 'مدفوع'");
                }
              }
            } else {
              console.log("No existing payment record found with ID:", transactionIdentifier);
            }
            
            // Get current user ID for more specific queries
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
              // Update all pending invoices for this user and plan
              const { error: updateAllError } = await supabase
                .from('payment_invoices')
                .update({ status: 'مدفوع' })
                .eq('user_id', session.user.id)
                .eq('plan_name', plan)
                .in('status', ['Pending', 'قيد الانتظار', 'pending']);
                
              if (updateAllError) {
                console.error("Error updating all pending invoices:", updateAllError);
              } else {
                console.log("Updated all pending invoices for user");
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
  }, [transactionIdentifier, customId, txnId, searchParams]);

  return { transactionIdentifier, isVerifying };
};
