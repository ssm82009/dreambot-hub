
// استخدام المسار الكامل لتجنب مشاكل الاستيراد في Deno
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import * as firebaseAdmin from "firebase-admin";

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

// تهيئة Firebase Admin SDK
let initialized = false;
function initializeFirebase() {
  if (initialized) return;
  
  try {
    const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}');
    
    if (!serviceAccount.project_id) {
      throw new Error('تكوين Firebase غير صالح أو مفقود');
    }
    
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount)
    });
    
    initialized = true;
    console.log("تم تهيئة Firebase Admin SDK بنجاح");
  } catch (error) {
    console.error("فشل في تهيئة Firebase Admin SDK:", error);
    throw error;
  }
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

    console.log("إنشاء عميل Supabase...");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    console.log("تم إنشاء عميل Supabase بنجاح");

    // تهيئة Firebase
    try {
      console.log("بدء تهيئة Firebase Admin SDK...");
      initializeFirebase();
    } catch (error) {
      console.error("فشل في تهيئة Firebase Admin SDK:", error);
      return new Response(
        JSON.stringify({ error: 'فشل في تهيئة Firebase Admin SDK', details: error.message }),
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

    // البحث عن رموز (توكنات) FCM للمستخدمين
    let tokens: string[] = [];

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
        
        const { data, error: tokenError } = await supabaseAdmin
          .from('fcm_tokens')
          .select('token')
          .in('user_id', adminIds);

        if (tokenError) {
          console.error("خطأ في جلب رموز المشرفين:", tokenError);
          return new Response(
            JSON.stringify({ error: 'خطأ في جلب رموز المشرفين', details: tokenError.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        if (data) {
          tokens = data.map(record => record.token);
        }
        console.log(`تم العثور على ${tokens.length} رمز للمشرفين`);
      }
    } else if (userId) {
      // إرسال الإشعار لمستخدم محدد
      console.log(`جاري البحث عن رموز المستخدم ${userId}...`);
      const { data, error: tokenError } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', userId);

      if (tokenError) {
        console.error("خطأ في جلب رموز المستخدم:", tokenError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب رموز المستخدم', details: tokenError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (data) {
        tokens = data.map(record => record.token);
      }
      console.log(`تم العثور على ${tokens.length} رمز للمستخدم`);
    } else if (allUsers) {
      // إرسال الإشعار لجميع المستخدمين
      console.log("جاري البحث عن جميع الرموز...");
      const { data, error: tokenError } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token');

      if (tokenError) {
        console.error("خطأ في جلب جميع الرموز:", tokenError);
        return new Response(
          JSON.stringify({ error: 'خطأ في جلب جميع الرموز', details: tokenError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (data) {
        tokens = data.map(record => record.token);
      }
      console.log(`تم العثور على ${tokens.length} رمز إجمالي`);
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

    // إذا لم يوجد رموز (توكنات)، لا يوجد داعي للمتابعة
    if (tokens.length === 0) {
      console.log("لا يوجد رموز لإرسال الإشعارات إليها");
      return new Response(
        JSON.stringify({ success: true, message: 'لا يوجد رموز مستهدفة', sentCount: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إعداد رسالة الإشعار
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: {
        url: notification.url || '/',
        type: notification.type || 'general'
      },
      tokens: tokens
    };
    
    console.log(`محاولة إرسال الإشعارات إلى ${tokens.length} رمز...`);
    
    try {
      // إرسال الإشعار باستخدام Firebase
      const response = await firebaseAdmin.messaging().sendMulticast(message);
      console.log(`تم إرسال الإشعار بنجاح: ${response.successCount} نجاح، ${response.failureCount} فشل`);
      
      // تسجيل الإشعارات في قاعدة البيانات
      if (userId) {
        try {
          await supabaseAdmin
            .from('notification_logs')
            .insert({
              user_id: userId,
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
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `تم إرسال ${response.successCount} من ${tokens.length} إشعارات بنجاح`,
          sentCount: response.successCount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('خطأ في إرسال الإشعارات عبر Firebase:', error);
      return new Response(
        JSON.stringify({ error: 'خطأ في إرسال الإشعارات', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
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
