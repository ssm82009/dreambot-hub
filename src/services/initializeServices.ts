
import { setupFirebase } from './firebase/firebaseClient';
import { runFcmMigrations } from './runFcmMigrations';
import OneSignalServiceInstance from './oneSignalService';

/**
 * Service for initializing app components in a controlled sequence
 * with proper error handling
 */
export const initializeServices = async () => {
  const results = {
    migrations: false,
    firebase: false,
    oneSignal: false,
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
    
    // Then setup Firebase regardless of migration status
    try {
      console.log("Setting up Firebase...");
      results.firebase = await setupFirebase();
      console.log(`Firebase setup ${results.firebase ? 'completed successfully' : 'had issues'}`);
    } catch (firebaseError) {
      console.error("Error in Firebase setup:", firebaseError);
      // Continue despite Firebase errors
    }
    
    // Initialize OneSignal
    try {
      console.log("Initializing OneSignal...");
      // Replace with your actual OneSignal App ID
      const appId = '40889d72-5084-41cc-8e76-bc9af4ab3f65';
      if (typeof window !== 'undefined' && window.OneSignal) {
        results.oneSignal = await OneSignalServiceInstance.initialize({
          appId
        });
        console.log(`OneSignal initialization ${results.oneSignal ? 'completed successfully' : 'had issues'}`);
      } else {
        console.warn("OneSignal is not available in this environment. Skipping initialization.");
      }
    } catch (oneSignalError) {
      console.error("Error in OneSignal initialization:", oneSignalError);
      // Continue despite OneSignal errors
    }

    return results;
  } catch (error) {
    console.error("Fatal error in service initialization:", error);
    return results;
  }
};
