
// استخدام المسار الكامل لتجنب مشاكل الاستيراد في Deno
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

// تعريف رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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
  console.log("وظيفة send-notification تم استدعاؤها، طريقة الطلب:", req.method);
  
  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    console.log("تمت معالجة طلب OPTIONS لـ CORS");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // فحص المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("خطأ المصادقة: ترويسة التخويل مفقودة");
      return new Response(
        JSON.stringify({ error: 'غير مصرح. ترويسة Authorization مطلوبة.' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // إعداد مفاتيح VAPID للإشعارات
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("مفاتيح VAPID غير مهيأة");
      return new Response(
        JSON.stringify({ error: 'مفاتيح VAPID غير مهيأة' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إعداد web-push بطريقة آمنة
    try {
      webPush.setVapidDetails(
        'mailto:support@example.com',
        vapidPublicKey,
        vapidPrivateKey
      );
    } catch (error) {
      console.error("خطأ في إعداد مفاتيح VAPID:", error);
      return new Response(
        JSON.stringify({ error: 'فشل في إعداد مفاتيح VAPID', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // تحليل بيانات الطلب
    let requestData: RequestBody;
    try {
      requestData = await req.json();
      console.log("بيانات الطلب المستلمة:", JSON.stringify(requestData));
    } catch (error) {
      console.error("خطأ في تحليل بيانات الطلب JSON:", error);
      return new Response(
        JSON.stringify({ error: 'بيانات JSON غير صالحة' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { userId, adminOnly, allUsers, notification } = requestData;

    if (!notification?.title || !notification?.body) {
      console.error("بيانات الإشعار غير كاملة");
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
      console.log("جاري البحث عن المشرفين...");
      const { data: admins, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (adminError) {
        console.error("خطأ في جلب المشرفين:", adminError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب المشرفين', details: adminError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (admins && admins.length > 0) {
        const adminIds = admins.map((admin) => admin.id);
        console.log(`تم العثور على ${adminIds.length} مشرف`);
        
        const { data, error: subError } = await supabaseAdmin
          .from('push_subscriptions')
          .select('*')
          .in('user_id', adminIds);

        if (subError) {
          console.error("خطأ في جلب اشتراكات المشرفين:", subError);
          return new Response(
            JSON.stringify({ error: 'خطأ في جلب اشتراكات المشرفين', details: subError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        subscriptions = data || [];
        console.log(`تم العثور على ${subscriptions.length} اشتراك للمشرفين`);
      }
    } else if (userId) {
      // إرسال الإشعار لمستخدم محدد
      console.log(`جاري البحث عن اشتراكات المستخدم ${userId}...`);
      const { data, error: subError } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (subError) {
        console.error("خطأ في جلب اشتراكات المستخدم:", subError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب اشتراكات المستخدم', details: subError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      subscriptions = data || [];
      console.log(`تم العثور على ${subscriptions.length} اشتراك للمستخدم`);
    } else if (allUsers) {
      // إرسال الإشعار لجميع المستخدمين
      console.log("جاري البحث عن جميع الاشتراكات...");
      const { data, error: subError } = await supabaseAdmin
        .from('push_subscriptions')
        .select('*');

      if (subError) {
        console.error("خطأ في جلب جميع الاشتراكات:", subError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب جميع الاشتراكات', details: subError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      subscriptions = data || [];
      console.log(`تم العثور على ${subscriptions.length} اشتراك إجمالي`);
    } else {
      console.error("لم يتم تحديد المستخدمين المستهدفين");
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
      console.log("لا يوجد مشتركين لإرسال الإشعارات إليهم");
      return new Response(
        JSON.stringify({ success: true, message: 'لا يوجد مشتركين', sentCount: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إرسال الإشعار لكل مشترك
    console.log(`محاولة إرسال الإشعارات إلى ${subscriptions.length} مشترك...`);
    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        // تحليل البيانات بشكل آمن
        let parsedSubscription;
        try {
          parsedSubscription = JSON.parse(subscription.auth);
          
          // التحقق من أن البيانات تحتوي على الحقول المطلوبة
          if (!parsedSubscription.endpoint || !parsedSubscription.keys) {
            console.error(`اشتراك غير صالح للمستخدم ${subscription.id}`);
            return false;
          }
        } catch (error) {
          console.error(`خطأ في تحليل بيانات الاشتراك للمستخدم ${subscription.id}:`, error);
          return false;
        }
        
        const pushPayload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          url: notification.url || '/',
          type: notification.type || 'general'
        });

        console.log(`محاولة إرسال إشعار للمشترك ${subscription.id}`);

        // إرسال الإشعار باستخدام web-push
        try {
          await webPush.sendNotification(
            parsedSubscription,
            pushPayload
          );
          console.log(`تم إرسال الإشعار بنجاح للمشترك ${subscription.id}`);
        } catch (pushError) {
          console.error(`خطأ في إرسال الإشعار للمشترك ${subscription.id}:`, pushError);
          return false;
        }

        // تسجيل الإشعار في قاعدة البيانات
        try {
          await supabaseAdmin
            .from('notification_logs')
            .insert({
              user_id: subscription.user_id,
              title: notification.title,
              body: notification.body,
              url: notification.url,
              type: notification.type,
              sent_at: new Date().toISOString()
            });
        } catch (logError) {
          console.error(`خطأ في تسجيل الإشعار في قاعدة البيانات:`, logError);
          // لا نريد أن نفشل العملية برمتها إذا فشل التسجيل، لذلك نستمر
        }

        return true;
      } catch (error) {
        console.error(`خطأ في معالجة الإشعار للمشترك ${subscription.id}:`, error);
        return false;
      }
    });

    // انتظار إكمال جميع عمليات الإرسال
    const results = await Promise.all(pushPromises);
    const successCount = results.filter(Boolean).length;

    console.log(`تم إرسال ${successCount} من ${subscriptions.length} إشعارات بنجاح`);
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
      JSON.stringify({ error: 'حدث خطأ أثناء معالجة الطلب', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
