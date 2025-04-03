
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Update user subscription type and expiry date
 */
export const updateUserSubscription = async (userId: string, plan: string): Promise<boolean> => {
  if (!userId || !plan) {
    console.error("Missing userId or plan for subscription update");
    return false;
  }
  
  try {
    // Set expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update the user's subscription in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        subscription_type: plan,
        subscription_expires_at: expiryDate.toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Error updating user subscription:", updateError);
      toast.error("حدث خطأ أثناء تحديث الاشتراك");
      return false;
    } 
    
    console.log("Updated subscription successfully for user:", userId, "to plan:", plan);
    return true;
  } catch (error) {
    console.error("Error in updateUserSubscription:", error);
    return false;
  }
};
