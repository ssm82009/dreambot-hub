
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentSuccessContent from '@/components/payment/PaymentSuccessContent';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const { transactionIdentifier, isVerifying, paymentSession, sessionId, paymentUpdated } = usePaymentVerification();
  const [isVerified, setIsVerified] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Verify that the subscription has been updated after payment verification
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isVerifying) {
        setIsChecking(true);
        try {
          // Check if the current user has a valid subscription
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.id) {
            console.log("Checking subscription status for user:", session.user.id);
            
            // Check user subscription status
            const { data: userData, error } = await supabase
              .from('users')
              .select('subscription_type, subscription_expires_at')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error("Error checking subscription:", error);
              return;
            }
            
            console.log("Current user subscription data:", userData);
            
            if (userData?.subscription_type && userData.subscription_type !== 'free') {
              // Validate that expiry date is in the future
              const expiryDate = new Date(userData.subscription_expires_at);
              const now = new Date();
              
              if (expiryDate > now) {
                setIsVerified(true);
                console.log("Payment successfully verified. Subscription active until:", expiryDate);
              } else {
                console.error("Subscription expiry date is not valid:", expiryDate);
              }
            } else {
              console.error("Subscription type is not valid:", userData?.subscription_type);
              
              // Force update subscription if we're on success page but subscription is not active
              if (paymentSession?.plan_type) {
                console.log("Forcing subscription update to:", paymentSession.plan_type);
                
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ 
                    subscription_type: paymentSession.plan_type,
                    subscription_expires_at: expiryDate.toISOString()
                  })
                  .eq('id', session.user.id);
                  
                if (!updateError) {
                  setIsVerified(true);
                  console.log("Forced subscription update successful");
                } else {
                  console.error("Forced subscription update failed:", updateError);
                }
              }
            }
            
            // الطريقة 1: البحث باستخدام معرف جلسة الدفع
            if (sessionId) {
              console.log("Looking for payment invoice with session ID:", sessionId);
              
              const { data: invoiceData, error: invoiceError } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', sessionId)
                .eq('user_id', session.user.id)
                .limit(1);
                
              if (!invoiceError && invoiceData && invoiceData.length > 0) {
                const paymentRecord = invoiceData[0];
                console.log("Found payment record by session ID:", paymentRecord);
                setPaymentData(paymentRecord);
                
                // Update status to "مدفوع" if currently pending
                if (paymentRecord.status === 'قيد الانتظار' || paymentRecord.status === 'pending' || paymentRecord.status === 'Pending') {
                  await supabase
                    .from('payment_invoices')
                    .update({ status: 'مدفوع' })
                    .eq('id', paymentRecord.id);
                }
                
                return;
              }
            }
            
            // الطريقة 2: البحث باستخدام معرف المعاملة
            if (transactionIdentifier) {
              console.log("Looking for payment with transaction ID:", transactionIdentifier);
              
              const { data: invoiceData, error: invoiceError } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', transactionIdentifier)
                .eq('user_id', session.user.id)
                .limit(1);
                
              if (!invoiceError && invoiceData && invoiceData.length > 0) {
                const paymentRecord = invoiceData[0];
                console.log("Found payment record by transaction ID:", paymentRecord);
                setPaymentData(paymentRecord);
                
                // Update status to "مدفوع" if currently pending
                if (paymentRecord.status === 'قيد الانتظار' || paymentRecord.status === 'pending' || paymentRecord.status === 'Pending') {
                  await supabase
                    .from('payment_invoices')
                    .update({ status: 'مدفوع' })
                    .eq('id', paymentRecord.id);
                }
                
                return;
              }
            }
            
            // الطريقة 3: الحصول على آخر دفعة للمستخدم
            console.log("Looking for user's most recent payment");
            
            const { data: userPayments, error: userPaymentsError } = await supabase
              .from('payment_invoices')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (!userPaymentsError && userPayments && userPayments.length > 0) {
              const paymentRecord = userPayments[0];
              console.log("Found user's most recent payment:", paymentRecord);
              setPaymentData(paymentRecord);
              
              // Update status to "مدفوع" if currently pending
              if (paymentRecord.status === 'قيد الانتظار' || paymentRecord.status === 'pending' || paymentRecord.status === 'Pending') {
                await supabase
                  .from('payment_invoices')
                  .update({ status: 'مدفوع' })
                  .eq('id', paymentRecord.id);
              }
            }
          }
        } catch (error) {
          console.error("Error in subscription verification:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };
    
    checkSubscription();
  }, [transactionIdentifier, isVerifying, sessionId, paymentSession, paymentUpdated]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <PaymentSuccessContent 
          transactionIdentifier={transactionIdentifier}
          isVerified={isVerified || paymentUpdated}
          isVerifying={isVerifying || isChecking}
          paymentData={paymentData}
          paymentSession={paymentSession}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
