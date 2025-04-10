
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, deleteFCMToken } from './firebaseClient';
import { toast } from 'sonner';

type FcmToken = {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
};

// Register FCM token in Supabase database
export const registerFCMToken = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('User ID not provided');
      return false;
    }

    console.log('Getting FCM token for user:', userId);
    const token = await getFCMToken();
    
    if (!token) {
      console.error('Failed to get FCM token');
      return false;
    }

    // Check if token exists in database
    // Using raw query to avoid TypeScript issues
    const { data: existingTokenCount, error: checkError } = await supabase.rpc(
      'check_fcm_token_exists',
      { 
        p_token: token,
        p_user_id: userId
      }
    ) as { data: number | null, error: any };

    if (checkError) {
      console.error('Error checking token existence:', checkError);
      return false;
    }

    // If token already exists, exit
    if (existingTokenCount && existingTokenCount > 0) {
      console.log('Token already registered');
      return true;
    }

    // Add new token
    // Using raw query to avoid TypeScript issues
    const { error: insertError } = await supabase.rpc(
      'insert_fcm_token',
      {
        p_user_id: userId,
        p_token: token
      }
    );

    if (insertError) {
      console.error('Error registering FCM token:', insertError);
      return false;
    }

    console.log('FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

// Unregister FCM token
export const unregisterFCMToken = async (userId: string): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      // If we can't get current token, try to delete all user tokens
      const { error: deleteError } = await supabase.rpc(
        'delete_all_user_fcm_tokens',
        { p_user_id: userId }
      );

      if (deleteError) {
        console.error('Error deleting all user tokens:', deleteError);
        return false;
      }
    } else {
      // Delete specific token
      const { error: deleteError } = await supabase.rpc(
        'delete_fcm_token',
        { 
          p_token: token,
          p_user_id: userId
        }
      );

      if (deleteError) {
        console.error('Error deleting specific token:', deleteError);
        return false;
      }

      // Delete token from Firebase
      await deleteFCMToken();
    }

    console.log('FCM token unregistered successfully');
    return true;
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    return false;
  }
};
