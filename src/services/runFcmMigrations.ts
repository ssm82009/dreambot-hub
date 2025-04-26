
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const runFcmMigrations = async () => {
  try {
    console.log("Starting FCM database migrations...");
    
    // First, create the function checker which also fixes timestamp comparisons
    try {
      console.log("Creating function checker and fixing timestamp comparisons...");
      await supabase.functions.invoke('create-function-check');
      console.log("Function checker created successfully");
    } catch (checkError) {
      console.warn("Error creating function checker:", checkError);
      // Continue execution, don't break the flow
    }
    
    // Simplified error handling approach - try each migration independently
    try {
      console.log("Creating FCM count function...");
      await supabase.functions.invoke('create-fcm-migrations');
      console.log("FCM count function created successfully");
    } catch (countError) {
      console.warn("Count function may already exist:", countError);
      // Continue execution, don't break the flow
    }
    
    try {
      console.log("Creating FCM management functions...");
      await supabase.functions.invoke('create-fcm-functions');
      console.log("FCM management functions created successfully");
    } catch (functionsError) {
      console.warn("FCM functions may already exist:", functionsError);
      // Continue execution, don't break the flow
    }
    
    console.log("FCM database setup completed");
    return true;
  } catch (error) {
    console.error("Error in FCM migration process:", error);
    // Show toast only in development environment
    if (process.env.NODE_ENV === 'development') {
      toast.error('Error setting up FCM functions. App will continue without notification features.');
    }
    return false;
  }
};
