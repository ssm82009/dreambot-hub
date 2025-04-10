
import { supabase } from '@/integrations/supabase/client';

export const runFcmMigrations = async () => {
  try {
    // Creating database functions for FCM tokens
    console.log("Setting up FCM database functions...");
    
    // First create the count function
    await supabase.functions.invoke('create-fcm-migrations');
    
    // Then create the token management functions
    await supabase.functions.invoke('create-fcm-functions');
    
    console.log("FCM database functions created successfully");
    return true;
  } catch (error) {
    console.error("Error setting up FCM database functions:", error);
    return false;
  }
};
