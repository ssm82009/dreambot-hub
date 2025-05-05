
import { setupFirebase } from './firebase/firebaseClient';
import { runFcmMigrations } from './runFcmMigrations';

/**
 * Service for initializing app components in a controlled sequence
 * with proper error handling
 */
export const initializeServices = async () => {
  const results = {
    migrations: false,
    firebase: false,
  };

  try {
    console.log("Starting service initialization sequence");

    // First initialize the database functions and fix timestamp comparison issues
    try {
      console.log("Running database migrations...");
      results.migrations = await runFcmMigrations();
      console.log(`Database migrations ${results.migrations ? 'completed successfully' : 'had issues'}`);
    } catch (migrError) {
      console.error("Error in database migrations:", migrError);
      // Continue despite migration errors
    }
    
    // DISABLE Firebase setup since we're using OneSignal
    console.log("Firebase setup is disabled - using OneSignal instead");
    results.firebase = false;

    return results;
  } catch (error) {
    console.error("Fatal error in service initialization:", error);
    return results;
  }
};
