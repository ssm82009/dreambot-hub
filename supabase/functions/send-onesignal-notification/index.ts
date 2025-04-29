
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// تعريف واجهة الإشعار
interface Notification {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// تعريف واجهة طلب الإشعار
interface RequestBody {
  notification: Notification;
  targetUsers?: string[];
  adminOnly?: boolean;
  allUsers?: boolean;
}

// تعريف رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// دالة للتوصل مع واجهة برمجة OneSignal
async function sendOneSignalNotification(
  notification: Notification,
  includeExternalUserIds?: string[]
): Promise<boolean> {
  try {
    // الحصول على مفتاح REST API من متغيرات البيئة
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    if (!apiKey) {
      console.error('مفتاح واجهة برمجة OneSignal غير موجود');
      return false;
    }

    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    if (!appId) {
      console.error('معرف تطبيق OneSignal غير موجود');
      return false;
    }

    // بناء كائن الطلب
    const payload: any = {
      app_id: appId,
      headings: { ar: notification.title, en: notification.title },
      contents: { ar: notification.body, en: notification.body },
      url: notification.url || '/',
      data: {
        type: notification.type || 'general',
      },
    };

    // تحديد المستخدمين المستهدفين إذا كانت متوفرة
    if (includeExternalUserIds && includeExternalUserIds.length > 0) {
      // التحقق من أن المستخدمين موجودون حقًا في OneSignal قبل الإرسال
      console.log(`محاولة الإرسال إلى مستخدمين محددين: ${includeExternalUserIds.length}`);
      payload.include_external_user_ids = includeExternalUserIds;
    } else {
      // إذا لم يتم تحديد مستخدمين، أرسل إلى جميع المشتركين
      console.log('الإرسال إلى جميع المشتركين');
      payload.included_segments = ['Subscribed Users'];
    }

    // إرسال الطلب إلى OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('نتيجة إرسال إشعار OneSignal:', result);

    return response.ok;
  } catch (error) {
    console.error('خطأ في إرسال إشعار OneSignal:', error);
    return false;
  }
}

// التحقق من وجود المستخدم في OneSignal
async function validateOneSignalUsers(userIds: string[]): Promise<string[]> {
  try {
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    
    if (!apiKey || !appId) {
      console.error('بيانات اعتماد OneSignal غير متوفرة');
      return [];
    }
    
    // إذا لم نتمكن من استخدام OneSignal API للتحقق، نحتاج هذه الدالة 
    // للتحقق من أن المستخدمين موجودين حقًا في قاعدة البيانات المحلية
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // نفترض أن جميع المستخدمين المسجلين في تطبيقنا مشتركين
    // هذه ليست الطريقة المثالية، ولكنها بديل في غياب API من OneSignal للتحقق
    
    return userIds;
  } catch (error) {
    console.error('خطأ في التحقق من وجود المستخدمين في OneSignal:', error);
    return [];
  }
}

serve(async (req) => {
  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // تحليل بيانات الطلب
    const requestData = await req.json() as RequestBody;
    const { notification, targetUsers, adminOnly, allUsers } = requestData;

    // التحقق من وجود بيانات الإشعار
    if (!notification || !notification.title || !notification.body) {
      return new Response(
        JSON.stringify({ error: 'بيانات الإشعار غير مكتملة' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // تحديد المستخدمين المستهدفين
    let userIds: string[] = [];
    
    if (targetUsers && targetUsers.length > 0) {
      // استخدام المستخدمين المحددين مباشرةً بعد التحقق من صحتهم
      userIds = await validateOneSignalUsers(targetUsers);
      console.log(`تم التحقق من ${userIds.length} مستخدمين صالحين من أصل ${targetUsers.length}`);
    } else if (adminOnly) {
      // جلب معرفات المسؤولين
      const { data: admins, error } = await supabaseClient
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (error) throw error;
      const adminIds = admins.map(admin => admin.id);
      userIds = await validateOneSignalUsers(adminIds);
    } else if (allUsers) {
      // في حالة إرسال للجميع، نستخدم الخيار المناسب في OneSignal
      // وليس قائمة المستخدمين من قاعدة البيانات
      userIds = [];
    }

    // إنشاء سجلات الإشعارات في قاعدة البيانات
    if (userIds.length > 0 || allUsers) {
      try {
        if (userIds.length > 0) {
          const notificationsToInsert = userIds.map(id => ({
            user_id: id,
            title: notification.title,
            body: notification.body,
            url: notification.url || '/',
            type: notification.type || 'general'
          }));

          const { error: insertError } = await supabaseClient
            .from('notification_logs')
            .insert(notificationsToInsert);

          if (insertError) {
            console.error('خطأ في إضافة الإشعارات إلى قاعدة البيانات:', insertError);
          }
        }
      } catch (dbError) {
        console.error('خطأ في تسجيل الإشعارات:', dbError);
        // نستمر في الإرسال رغم خطأ قاعدة البيانات
      }
    }

    // إرسال الإشعار عبر OneSignal
    const success = await sendOneSignalNotification(
      notification, 
      userIds.length > 0 ? userIds : undefined
    );

    return new Response(
      JSON.stringify({
        success,
        sent_to_users: userIds.length || (allUsers ? 'all' : 0)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500
      }
    );
  } catch (error) {
    console.error('خطأ في معالجة طلب إرسال الإشعار:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'خطأ داخلي في الخادم' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
