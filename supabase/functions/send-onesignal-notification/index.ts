
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// إرسال الإشعارات عبر OneSignal
async function sendOneSignalNotification(
  notification: NotificationPayload,
  targetUsers?: string[],
  allUsers?: boolean
): Promise<boolean> {
  const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
  const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  if (!oneSignalAppId || !oneSignalApiKey) {
    console.error('OneSignal credentials are missing');
    return false;
  }

  try {
    // تكوين بيانات الإشعار
    const payload: any = {
      app_id: oneSignalAppId,
      headings: { en: notification.title, ar: notification.title },
      contents: { en: notification.body, ar: notification.body },
      data: {
        type: notification.type || 'general',
        url: notification.url || '/'
      },
      url: notification.url || '/',
      web_url: notification.url || '/',
    };

    // تحديد المستلمين
    if (targetUsers && targetUsers.length > 0) {
      payload.include_external_user_ids = targetUsers;
    } else if (allUsers) {
      payload.included_segments = ['All'];
    } else {
      console.error('No target users specified');
      return false;
    }

    console.log('Sending OneSignal notification:', JSON.stringify(payload));

    // إرسال الإشعار
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OneSignal API error:', response.status, errorData);
      return false;
    }

    const responseData = await response.json();
    console.log('OneSignal API response:', responseData);
    
    // تخزين سجل الإشعار في قاعدة البيانات
    if (targetUsers && targetUsers.length > 0) {
      await storeNotificationLogs(notification, targetUsers);
    }

    return true;
  } catch (error) {
    console.error('Error sending OneSignal notification:', error);
    return false;
  }
}

// تخزين سجلات الإشعارات
async function storeNotificationLogs(notification: NotificationPayload, userIds: string[]): Promise<void> {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const notificationLogs = userIds.map(userId => ({
      user_id: userId,
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      type: notification.type || 'general',
      sent_at: new Date().toISOString()
    }));

    const { error } = await supabaseAdmin
      .from('notification_logs')
      .insert(notificationLogs);

    if (error) {
      console.error('Error storing notification logs:', error);
    }
  } catch (error) {
    console.error('Error in storing notification logs:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { notification, targetUsers, allUsers } = await req.json();

    if (!notification || (!targetUsers && !allUsers)) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification data', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const result = await sendOneSignalNotification(notification, targetUsers, allUsers);

    return new Response(
      JSON.stringify({ success: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error in send-onesignal-notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
