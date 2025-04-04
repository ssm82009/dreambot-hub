
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
            
            if (userData?.subscription_type && userData.subscription_type !== 'free') {
              // Validate that expiry date is in the future
              const expiryDate = new Date(userData.subscription_expires_at);
              const now = new Date();
              
              if (expiryDate > now) {
                setIsVerified(true);
                console.log("Payment successfully verified. Subscription active until:", expiryDate);
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
