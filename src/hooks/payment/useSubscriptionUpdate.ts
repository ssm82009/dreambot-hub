
import { supabase } from '@/integrations/supabase/client';
import { verifyPayment } from '@/utils/payment/verifyPayment';
import { toast } from 'sonner';

/**
 * Handle user subscription verification and updates
 */
export const useSubscriptionUpdate = () => {
  const updateUserSubscription = async (transactionIdentifier: string, customId: string, txnId: string, planType: string | null) => {
    if (!planType) return false;
    
    try {
      console.log("Updating subscription with:", { transactionIdentifier, customId, txnId, planType });
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("Cannot update subscription - no authenticated user");
        return false;
      }
      
      // Use the existing verifyPayment utility
      const result = await verifyPayment(
        transactionIdentifier,
        customId,
        txnId,
        planType
      );
      
      if (result) {
        // Update user subscription directly to ensure it's updated
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription_type: planType,
            subscription_expires_at: expiryDate.toISOString()
          })
          .eq('id', session.user.id);
          
        if (updateError) {
          console.error("Error updating user subscription:", updateError);
          return false;
        }
        
        console.log("Updated user subscription successfully to:", planType);
        return true;
      }
      
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
