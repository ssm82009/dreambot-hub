
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyPayment } from '@/utils/payment/verifyPayment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  
  // SESSION PARAMS - أهم معرف يجب البحث عنه
  const sessionId = searchParams.get('session_id') || '';
  
  // PayLink params
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  
  // PayPal params
  const paymentId = searchParams.get('paymentId') || '';
  const token = searchParams.get('token') || '';
  const customId = searchParams.get('custom') || '';
  const txnId = searchParams.get('tx') || '';
  const payerID = searchParams.get('PayerID') || '';
  
  // Get any available transaction identifier
  const transactionIdentifier = transactionNo || orderNumber || paymentId || token || txnId || customId;
  
  useEffect(() => {
    const handleVerification = async () => {
      try {
        setIsVerifying(true);
        
        // Log all search parameters for debugging
        console.log("Payment verification search params:", Object.fromEntries(searchParams.entries()));
        
        // Get current user ID for more specific queries
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          console.error("No authenticated user found");
          setIsVerifying(false);
          return;
        }
        
        // STEP 1: Find the payment session in the database
        let foundPaymentSession = null;
        
        // First try to find by session_id (most reliable method)
        if (sessionId) {
          console.log("Looking for payment session by session_id:", sessionId);
          
          const { data: sessionData, error: sessionError } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('session_id', sessionId)
            .eq('user_id', userId)
            .single();
            
          if (!sessionError && sessionData) {
            console.log("Found payment session by session_id:", sessionData);
            foundPaymentSession = sessionData;
          } else {
            console.log("No payment session found by session_id, trying transaction ID");
          }
        }
        
        // If no session found by session_id, try transaction_identifier
        if (!foundPaymentSession && transactionIdentifier) {
          console.log("Looking for payment session by transaction_identifier:", transactionIdentifier);
          
          const { data: sessionByTxData, error: sessionByTxError } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('transaction_identifier', transactionIdentifier)
            .eq('user_id', userId)
            .single();
            
          if (!sessionByTxError && sessionByTxData) {
            console.log("Found payment session by transaction_identifier:", sessionByTxData);
            foundPaymentSession = sessionByTxData;
          } else {
            console.log("No payment session found by transaction_identifier");
          }
        }
        
        // If still no session found, try the latest pending session for the user
        if (!foundPaymentSession) {
          console.log("Looking for latest pending payment session for user:", userId);
          
          const { data: latestSessionData, error: latestSessionError } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('completed', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!latestSessionError && latestSessionData) {
            console.log("Found latest pending payment session:", latestSessionData);
            foundPaymentSession = latestSessionData;
          } else {
            console.log("No pending payment sessions found for user");
          }
        }
        
        if (!foundPaymentSession) {
          console.error("No payment session found for verification");
          setIsVerifying(false);
          return;
        }
        
        setPaymentSession(foundPaymentSession);
        
        // STEP 2: Update payment session with transaction details
        if (transactionIdentifier && !foundPaymentSession.transaction_identifier) {
          console.log("Updating payment session with transaction identifier:", transactionIdentifier);
          
          await supabase
            .from('payment_sessions')
            .update({ transaction_identifier: transactionIdentifier })
            .eq('id', foundPaymentSession.id);
        }
        
        // STEP 3: Get invoice from payment_invoices
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('payment_invoices')
          .select('*')
          .or(`invoice_id.eq.${foundPaymentSession.session_id},invoice_id.eq.${transactionIdentifier}`)
          .eq('user_id', userId)
          .eq('plan_name', foundPaymentSession.plan_type)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (invoiceError) {
          console.error("Error fetching invoice:", invoiceError);
        }
        
        const invoice = invoiceData && invoiceData.length > 0 ? invoiceData[0] : null;
        
        if (invoice) {
          console.log("Found invoice for payment session:", invoice);
          
          // Update invoice status to paid
          if (invoice.status !== 'مدفوع') {
            await supabase
              .from('payment_invoices')
              .update({ status: 'مدفوع' })
              .eq('id', invoice.id);
          }
        } else {
          console.log("No invoice found, creating a new one");
          
          // Create a new invoice record
          await supabase.from('payment_invoices').insert({
            invoice_id: transactionIdentifier || foundPaymentSession.session_id,
            user_id: userId,
            plan_name: foundPaymentSession.plan_type,
            amount: foundPaymentSession.amount,
            status: 'مدفوع',
            payment_method: foundPaymentSession.payment_method
          });
        }
        
        // STEP 4: Mark the payment session as completed
        await supabase
          .from('payment_sessions')
          .update({ 
            completed: true,
            status: 'completed'
          })
          .eq('id', foundPaymentSession.id);
          
        // STEP 5: Update the user's subscription and verify payment
        await verifyPayment(
          transactionIdentifier || foundPaymentSession.transaction_identifier,
          customId,
          txnId,
          foundPaymentSession.plan_type
        );
        
        // Display success message
        const planName = foundPaymentSession.plan_type.toLowerCase().includes('مميز') || 
                         foundPaymentSession.plan_type === 'premium' 
          ? 'المميزة' 
          : 'الاحترافية';
          
        toast.success(`تم الاشتراك في الباقة ${planName} بنجاح!`);
      } catch (error) {
        console.error("Error in payment verification:", error);
        toast.error("حدث خطأ في التحقق من الدفع. يرجى الاتصال بالدعم الفني.");
      } finally {
        setIsVerifying(false);
      }
    };

    // Only proceed with verification if we have a user
    if (sessionId || transactionIdentifier) {
      handleVerification();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, transactionIdentifier, customId, txnId, searchParams, payerID]);

  return {
    paymentSession,
    transactionIdentifier: transactionIdentifier || (paymentSession?.transaction_identifier || ''),
    isVerifying,
    sessionId
  };
};
