
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentSuccessContent from '@/components/payment/PaymentSuccessContent';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const { transactionIdentifier } = usePaymentVerification();
  const [isVerified, setIsVerified] = useState(false);

  // Verify that the subscription has been updated after payment verification
  useEffect(() => {
    const checkSubscription = async () => {
      if (transactionIdentifier) {
        try {
          // Check if the current user has a valid subscription
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.id) {
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
          }
        } catch (error) {
          console.error("Error in subscription verification:", error);
        }
      }
    };
    
    checkSubscription();
  }, [transactionIdentifier]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <PaymentSuccessContent 
          transactionIdentifier={transactionIdentifier}
          isVerified={isVerified}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
