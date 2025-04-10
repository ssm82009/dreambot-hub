
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Define notification types
interface Notification {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// Define request body shape
interface RequestBody {
  userId?: string;        // specific user ID
  adminOnly?: boolean;    // send to admins only
  allUsers?: boolean;     // send to all users
  notification: Notification;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to send Firebase notification
async function sendFirebaseNotification(fcmTokens: string[], notification: Notification) {
  try {
    // Get FCM server key from environment variables
    const serverKey = Deno.env.get('FCM_SERVER_KEY');
    if (!serverKey) {
      console.error('FCM_SERVER_KEY not set in environment variables');
      return false;
    }

    const results = await Promise.all(fcmTokens.map(async (token) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${serverKey}`
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: notification.title,
              body: notification.body,
              click_action: notification.url || '/',
            },
            data: {
              url: notification.url || '/',
              type: notification.type || 'general',
            }
          })
        });

        const result = await response.json();
        console.log('FCM notification send result:', result);
        return response.ok;
      } catch (error) {
        console.error('Error sending FCM notification:', error);
        return false;
      }
    }));

    return results.some(success => success);
  } catch (error) {
    console.error('Error sending Firebase notifications:', error);
    return false;
  }
}

// Helper function for sending Web Push notifications
// Simplified as we're focusing on FCM for now
async function sendWebPushNotification(subscription: any, notification: Notification) {
  try {
    console.log("Sending Web Push notification to:", subscription.endpoint);
    
    // In a complete version, we would use a Deno-compatible library 
    // to send Web Push notifications or implement it manually
    
    return true;
  } catch (error) {
    console.error("Error sending Web Push notification:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse incoming request
    const requestData = await req.json() as RequestBody;
    const { userId, adminOnly, allUsers, notification } = requestData;

    // Log the notification in the database first
    let targetUserIds: string[] = [];

    // Determine target users
    if (allUsers) {
      // Get all users
      const { data: allUserIds } = await supabaseClient
        .from('users')
        .select('id');
      
      targetUserIds = allUserIds?.map(user => user.id) || [];
    } else if (adminOnly) {
      // Get all admins
      const { data: adminIds } = await supabaseClient
        .from('users')
        .select('id')
        .eq('role', 'admin');
      
      targetUserIds = adminIds?.map(admin => admin.id) || [];
    } else if (userId) {
      // Specific user
      targetUserIds = [userId];
    } else {
      return new Response(
        JSON.stringify({ error: 'Must specify a user or group of users' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create notification records to insert
    const notificationsToInsert = targetUserIds.map(id => ({
      user_id: id,
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      type: notification.type || 'general'
    }));

    // Insert notifications into database
    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('notification_logs')
        .insert(notificationsToInsert);

      if (insertError) {
        console.error('Error adding notifications to database:', insertError);
        // Continue trying to send notifications anyway
      }
    }

    // 1. Send Web Push notifications
    let webPushResults = {};
    for (const uid of targetUserIds) {
      // Get Web Push subscriptions for the user
      const { data: subscriptions, error: subError } = await supabaseClient
        .from('push_subscriptions')
        .select('auth, endpoint')
        .eq('user_id', uid);

      if (subError) {
        console.error(`Error fetching Web Push subscriptions for user ${uid}:`, subError);
        continue;
      }

      if (subscriptions && subscriptions.length > 0) {
        // Send notifications to all user subscriptions
        const results = await Promise.all(subscriptions.map(async sub => {
          try {
            const subscription = JSON.parse(sub.auth);
            return await sendWebPushNotification(subscription, notification);
          } catch (error) {
            console.error('Error parsing Web Push subscription:', error);
            return false;
          }
        }));
        
        webPushResults[uid] = results.filter(Boolean).length;
      }
    }

    // 2. Send Firebase notifications
    let firebaseResults = {};
    for (const uid of targetUserIds) {
      // Get FCM tokens for the user
      const { data: tokens, error: tokenError } = await supabaseClient
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', uid);

      if (tokenError) {
        console.error(`Error fetching FCM tokens for user ${uid}:`, tokenError);
        continue;
      }

      if (tokens && tokens.length > 0) {
        // Extract tokens
        const fcmTokens = tokens.map(t => t.token);
        
        // Send notifications via Firebase
        const success = await sendFirebaseNotification(fcmTokens, notification);
        firebaseResults[uid] = success;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_to: targetUserIds.length,
        webPushResults,
        firebaseResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing notification request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
