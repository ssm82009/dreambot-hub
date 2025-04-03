
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
            
            // Fetch the payment record to display - first try with transaction identifier
            let paymentRecord = null;
            let paymentError = null;
            
            if (transactionIdentifier) {
              const { data: invoiceData, error: invoiceError } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', transactionIdentifier)
                .single();
                
              if (!invoiceError && invoiceData) {
                paymentRecord = invoiceData;
                paymentError = null;
              } else {
                console.log("No invoice found with transaction ID, looking for user's recent invoices");
                
                // If not found by transaction ID, try getting the most recent invoice for this user
                const { data: userInvoices, error: userInvoicesError } = await supabase
                  .from('payment_invoices')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .order('created_at', { ascending: false })
                  .limit(1);
                
                if (!userInvoicesError && userInvoices && userInvoices.length > 0) {
                  paymentRecord = userInvoices[0];
                  paymentError = null;
                } else {
                  paymentError = userInvoicesError || new Error("No payment records found");
                }
              }
            } else {
              // If no transaction identifier, just get the user's most recent invoice
              const { data: userInvoices, error: userInvoicesError } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (!userInvoicesError && userInvoices && userInvoices.length > 0) {
                paymentRecord = userInvoices[0];
                paymentError = null;
              } else {
                paymentError = userInvoicesError || new Error("No payment records found");
              }
            }
            
            if (paymentRecord) {
              setPaymentData(paymentRecord);
              
              // If payment is still pending despite being on success page, update it
              if (paymentRecord.status === 'Pending' || 
                  paymentRecord.status === 'قيد الانتظار' || 
                  paymentRecord.status === 'pending') {
                console.log("Found pending payment record. Updating to paid:", paymentRecord);
                
                const { error: updateError } = await supabase
                  .from('payment_invoices')
                  .update({ status: 'مدفوع' })
                  .eq('id', paymentRecord.id);
                  
                if (!updateError) {
                  console.log("Updated payment status to 'مدفوع'");
                  setPaymentData({...paymentRecord, status: 'مدفوع'});
                } else {
                  console.error("Error updating payment status:", updateError);
                }
              }
            } else if (paymentError) {
              console.error("Error fetching payment data:", paymentError);
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
  }, [transactionIdentifier, isVerifying]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <PaymentSuccessContent 
          transactionIdentifier={transactionIdentifier}
          isVerified={isVerified}
          isVerifying={isVerifying || isChecking}
          paymentData={paymentData}
        />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
