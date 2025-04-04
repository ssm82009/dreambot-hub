
import { supabase } from '@/integrations/supabase/client';
import { verifyPayment } from '@/utils/payment/verifyPayment';

/**
 * Handle user subscription verification and updates
 */
export const useSubscriptionUpdate = () => {
  const updateUserSubscription = async (transactionIdentifier: string, customId: string, txnId: string, planType: string | null) => {
    if (!planType) return false;
    
    try {
      // Use the existing verifyPayment utility
      const result = await verifyPayment(
        transactionIdentifier,
        customId,
        txnId,
        planType
      );
      
      return result;
    } catch (error) {
      console.error("Error in subscription update:", error);
      return false;
    }
  };
  
  return {
    updateUserSubscription
  };
};
