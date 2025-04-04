
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePaymentParams } from './payment/usePaymentParams';
import { usePaymentSession } from './payment/usePaymentSession';
import { usePaymentUpdate } from './payment/usePaymentUpdate';
import { useSubscriptionUpdate } from './payment/useSubscriptionUpdate';

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Use the smaller, focused hooks
  const { 
    sessionId, 
    transactionIdentifier, 
    customId, 
    txnId,
    payerID,
    isSuccessPage 
  } = usePaymentParams();
  
  const { 
    paymentSession, 
    setPaymentSession,
    findSessionBySessionId,
    findSessionByTransactionId,
    findLatestPendingSession,
    updateSessionStatus
  } = usePaymentSession();
  
  const {
    paymentUpdated,
    setPaymentUpdated,
    updatePendingPayments,
    updatePaymentByIdentifier,
    showSuccessToast
  } = usePaymentUpdate();
  
  const { updateUserSubscription } = useSubscriptionUpdate();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        setIsVerifying(true);
        
        console.log("Payment verification search params:", { sessionId, transactionIdentifier, customId, txnId });
        
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          console.error("No authenticated user found");
          setIsVerifying(false);
          return;
        }

        // Find the payment session using the different strategies
        let foundPaymentSession = null;
        
        if (sessionId) {
          foundPaymentSession = await findSessionBySessionId(sessionId, userId);
          
          // Only update pending payments
          if (foundPaymentSession && 
             (foundPaymentSession.status === 'قيد الانتظار' || 
              foundPaymentSession.status === 'pending' || 
              foundPaymentSession.status === 'Pending')) {
            const updated = await updateSessionStatus(foundPaymentSession.id);
            if (updated) setPaymentUpdated(true);
          }
        }
        
        if (!foundPaymentSession && transactionIdentifier) {
          foundPaymentSession = await findSessionByTransactionId(transactionIdentifier, userId);
          
          // Only update pending payments
          if (foundPaymentSession && 
             (foundPaymentSession.status === 'قيد الانتظار' || 
              foundPaymentSession.status === 'pending' || 
              foundPaymentSession.status === 'Pending')) {
            const updated = await updateSessionStatus(foundPaymentSession.id);
            if (updated) setPaymentUpdated(true);
          }
        }
        
        if (!foundPaymentSession) {
          foundPaymentSession = await findLatestPendingSession(userId);
          
          if (foundPaymentSession) {
            const updated = await updateSessionStatus(foundPaymentSession.id);
            if (updated) setPaymentUpdated(true);
          }
        }
        
        if (!foundPaymentSession) {
          console.error("No payment session found for verification");
          setIsVerifying(false);
          return;
        }
        
        setPaymentSession(foundPaymentSession);
        
        // Update subscription status
        await updateUserSubscription(
          transactionIdentifier || (foundPaymentSession.session_id || ''),
          customId,
          txnId,
          foundPaymentSession.plan_type
        );
        
        // Update all pending payments for this plan
        if (isSuccessPage) {
          await updatePendingPayments(userId, foundPaymentSession.plan_type);
          
          // Also update by identifier if available
          if (transactionIdentifier) {
            await updatePaymentByIdentifier(transactionIdentifier, userId);
          }
        }
        
        // Show success message
        showSuccessToast(foundPaymentSession.plan_type);
      } catch (error) {
        console.error("Error in payment verification:", error);
        toast.error("حدث خطأ في التحقق من الدفع. يرجى الاتصال بالدعم الفني.");
      } finally {
        setIsVerifying(false);
      }
    };

    if ((sessionId || transactionIdentifier || isSuccessPage) && isSuccessPage) {
      handleVerification();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, transactionIdentifier, customId, txnId, payerID, isSuccessPage]);

  return {
    paymentSession,
    transactionIdentifier: transactionIdentifier || (paymentSession?.transaction_identifier || ''),
    isVerifying,
    sessionId,
    isSuccessPage,
    paymentUpdated
  };
};
