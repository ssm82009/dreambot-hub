
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import * as webPush from 'https://deno.land/x/web_push@v1.0.0/mod.ts';

// تعريف أنواع الإشعارات
interface Notification {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// تعريف شكل الطلب الوارد
interface RequestBody {
  userId?: string;        // معرف مستخدم محدد
  adminOnly?: boolean;    // إرسال إلى المشرفين فقط
  allUsers?: boolean;     // إرسال إلى جميع المستخدمين
  notification: Notification;
}

// رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// دالة مساعدة لإرسال إشعار Web Push
async function sendWebPushNotification(subscription: any, notification: Notification, vapidKeys: { publicKey: string, privateKey: string }) {
  try {
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      type: notification.type || 'general',
    });

    await webPush.sendNotification(
      subscription,
      payload,
      {
        vapidDetails: {
          subject: 'mailto:example@example.com',
          publicKey: vapidKeys.publicKey,
          privateKey: vapidKeys.privateKey,
        },
        TTL: 60 * 60, // الإشعار يبقى صالحًا لمدة ساعة
      }
    );
    return true;
  } catch (error) {
    console.error('خطأ في إرسال إشعار Web Push:', error);
    return false;
  }
}

// دالة لإرسال إشعار Firebase
async function sendFirebaseNotification(fcmTokens: string[], notification: Notification) {
  try {
    // جلب مفاتيح FCM السرية من متغيرات البيئة
    const serverKey = Deno.env.get('FCM_SERVER_KEY');
    if (!serverKey) {
      console.error('FCM_SERVER_KEY غير محدد في متغيرات البيئة');
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
        console.log('نتيجة إرسال إشعار FCM:', result);
        return response.ok;
      } catch (error) {
        console.error('خطأ في إرسال إشعار FCM:', error);
        return false;
      }
    }));

    return results.some(success => success);
  } catch (error) {
    console.error('خطأ في إرسال إشعارات Firebase:', error);
    return false;
  }
}

serve(async (req) => {
  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // إنشاء عميل Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // جلب مفاتيح VAPID من متغيرات البيئة
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys are not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // تحليل الطلب الوارد
    const requestData = await req.json() as RequestBody;
    const { userId, adminOnly, allUsers, notification } = requestData;

    // قم بتسجيل الإشعار في قاعدة البيانات أولاً
    let targetUserIds: string[] = [];

    // تحديد المستخدمين المستهدفين
    if (allUsers) {
      // جلب جميع المستخدمين
      const { data: allUserIds } = await supabaseClient
        .from('users')
        .select('id');
      
      targetUserIds = allUserIds?.map(user => user.id) || [];
    } else if (adminOnly) {
      // جلب جميع المشرفين
      const { data: adminIds } = await supabaseClient
        .from('users')
        .select('id')
        .eq('role', 'admin');
      
      targetUserIds = adminIds?.map(admin => admin.id) || [];
    } else if (userId) {
      // مستخدم محدد
      targetUserIds = [userId];
    } else {
      return new Response(
        JSON.stringify({ error: 'يجب تحديد مستخدم أو مجموعة مستخدمين' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // سجل الإشعارات في قاعدة البيانات
    const notificationsToInsert = targetUserIds.map(id => ({
      user_id: id,
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      type: notification.type || 'general'
    }));

    // إضافة الإشعارات إلى قاعدة البيانات
    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('notification_logs')
        .insert(notificationsToInsert);

      if (insertError) {
        console.error('خطأ في إضافة الإشعارات إلى قاعدة البيانات:', insertError);
        // نستمر في محاولة إرسال الإشعارات على أي حال
      }
    }

    // 1. إرسال إشعارات Web Push
    let webPushResults = {};
    for (const uid of targetUserIds) {
      // جلب اشتراكات Web Push للمستخدم
      const { data: subscriptions, error: subError } = await supabaseClient
        .from('push_subscriptions')
        .select('auth, endpoint')
        .eq('user_id', uid);

      if (subError) {
        console.error(`خطأ في جلب اشتراكات Web Push للمستخدم ${uid}:`, subError);
        continue;
      }

      if (subscriptions && subscriptions.length > 0) {
        // إرسال الإشعارات إلى جميع اشتراكات المستخدم
        const results = await Promise.all(subscriptions.map(async sub => {
          try {
            const subscription = JSON.parse(sub.auth);
            return await sendWebPushNotification(
              subscription, 
              notification, 
              { 
                publicKey: vapidPublicKey, 
                privateKey: vapidPrivateKey 
              }
            );
          } catch (error) {
            console.error('خطأ في تحليل اشتراك Web Push:', error);
            return false;
          }
        }));
        
        webPushResults[uid] = results.filter(Boolean).length;
      }
    }

    // 2. إرسال إشعارات Firebase
    let firebaseResults = {};
    for (const uid of targetUserIds) {
      // جلب توكنات FCM للمستخدم
      const { data: tokens, error: tokenError } = await supabaseClient
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', uid);

      if (tokenError) {
        console.error(`خطأ في جلب توكنات FCM للمستخدم ${uid}:`, tokenError);
        continue;
      }

      if (tokens && tokens.length > 0) {
        // استخراج التوكنات
        const fcmTokens = tokens.map(t => t.token);
        
        // إرسال الإشعارات عبر Firebase
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
    console.error('خطأ في معالجة طلب الإشعار:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'خطأ داخلي في السيرفر' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
