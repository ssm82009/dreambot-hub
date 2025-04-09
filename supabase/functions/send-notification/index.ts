
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { webPush } from 'https://esm.sh/web-push@3.6.7';

// تعريف رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// تعريف واجهة البيانات
interface RequestBody {
  userId?: string;
  adminOnly?: boolean;
  allUsers?: boolean;
  notification: {
    title: string;
    body: string;
    url?: string;
    type?: 'general' | 'ticket' | 'payment' | 'subscription';
  };
}

serve(async (req: Request) => {
  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // إعداد مفاتيح VAPID للإشعارات
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'مفاتيح VAPID غير مهيأة' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إعداد web-push
    webPush.setVapidDetails(
      'mailto:support@example.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    // تحليل بيانات الطلب
    const requestData: RequestBody = await req.json();
    const { userId, adminOnly, allUsers, notification } = requestData;

    if (!notification?.title || !notification?.body) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير عنوان ومحتوى للإشعار' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // البحث عن المشتركين
    let subscriptions = [];

    if (adminOnly) {
      // إرسال الإشعار للمشرفين فقط
      const { data: admins } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminIds = admins.map((admin) => admin.id);
        const { data } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .in('user_id', adminIds);

        subscriptions = data || [];
      }
    } else if (userId) {
      // إرسال الإشعار لمستخدم محدد
      const { data } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      subscriptions = data || [];
    } else if (allUsers) {
      // إرسال الإشعار لجميع المستخدمين
      const { data } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*');

      subscriptions = data || [];
    } else {
      return new Response(
        JSON.stringify({ error: 'يجب تحديد المستخدم أو مجموعة المستخدمين المستهدفة' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إذا لم يوجد مشتركين، لا يوجد داعي للمتابعة
    if (!subscriptions.length) {
      return new Response(
        JSON.stringify({ success: true, message: 'لا يوجد مشتركين', sentCount: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إرسال الإشعار لكل مشترك
    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        const parsedSubscription = JSON.parse(subscription.auth);
        
        const pushPayload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          url: notification.url || '/',
          type: notification.type || 'general'
        });

        console.log(`محاولة إرسال إشعار للمشترك ${subscription.id}`);

        // إرسال الإشعار باستخدام web-push
        await webPush.sendNotification(
          parsedSubscription,
          pushPayload
        );

        console.log(`تم إرسال الإشعار بنجاح للمشترك ${subscription.id}`);

        // تسجيل الإشعار في قاعدة البيانات
        await supabaseAdmin
          .from('notification_logs')
          .insert({
            user_id: subscription.user_id,
            title: notification.title,
            body: notification.body,
            url: notification.url,
            type: notification.type,
            sent_at: new Date()
          });

        return true;
      } catch (error) {
        console.error(`خطأ في إرسال الإشعار للمشترك ${subscription.id}:`, error);
        return false;
      }
    });

    // انتظار إكمال جميع عمليات الإرسال
    const results = await Promise.all(pushPromises);
    const successCount = results.filter(Boolean).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم إرسال ${successCount} من ${subscriptions.length} إشعارات بنجاح`,
        sentCount: successCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('خطأ في معالجة طلب الإشعار:', error);
    
    return new Response(
      JSON.stringify({ error: 'حدث خطأ أثناء معالجة الطلب' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
