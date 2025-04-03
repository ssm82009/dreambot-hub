
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentSuccessContent from '@/components/payment/PaymentSuccessContent';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const { transactionIdentifier, isVerifying } = usePaymentVerification();
  const [isVerified, setIsVerified] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Verify that the subscription has been updated after payment verification
  useEffect(() => {
    const checkSubscription = async () => {
      if (transactionIdentifier && !isVerifying) {
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
            
            // Fetch the payment record to display
            const { data: paymentRecord, error: paymentError } = await supabase
              .from('payment_invoices')
              .select('*')
              .eq('invoice_id', transactionIdentifier)
              .single();
              
            if (!paymentError && paymentRecord) {
              setPaymentData(paymentRecord);
              
              // If payment is still pending despite being on success page, update it
              if (paymentRecord.status === 'Pending' || paymentRecord.status === 'قيد الانتظار') {
                const { error: updateError } = await supabase
                  .from('payment_invoices')
                  .update({ status: 'مدفوع' })
                  .eq('id', paymentRecord.id);
                  
                if (!updateError) {
                  console.log("Updated payment status to 'مدفوع'");
                  setPaymentData({...paymentRecord, status: 'مدفوع'});
                }
              }
            }
          }
        } catch (error) {
          console.error("Error in subscription verification:", error);
        }
      }
    };
    
    checkSubscription();
  }, [transactionIdentifier, isVerifying]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <PaymentSuccessContent 
          transactionIdentifier={transactionIdentifier}
          isVerified={isVerified}
          isVerifying={isVerifying}
          paymentData={paymentData}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
