
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

    // Check if token exists in database using raw query
    const { data: existingTokens, error: checkError } = await supabase
      .from('fcm_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('token', token);

    if (checkError) {
      console.error('Error checking token existence:', checkError);
      return false;
    }

    // If token already exists, exit
    if (existingTokens && existingTokens.length > 0) {
      console.log('Token already registered');
      return true;
    }

    // Add new token using insert
    const { error: insertError } = await supabase
      .from('fcm_tokens')
      .insert([{
        user_id: userId,
        token: token
      }]);

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
      const { error: deleteError } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting all user tokens:', deleteError);
        return false;
      }
    } else {
      // Delete specific token
      const { error: deleteError } = await supabase
        .from('fcm_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token);

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
