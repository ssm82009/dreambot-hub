
// استخدام المسار الكامل لتجنب مشاكل الاستيراد في Deno
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as firebaseAdmin from "npm:firebase-admin";

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
  tokens?: string[]; // إضافة خاصية للرموز المباشرة
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
    // التأكد من إضافة رؤوس CORS إلى جميع الاستجابات
    const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

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
          headers: headers,
        }
      );
    }
    
    const { tokens, notification } = requestData;

    if (!notification?.title || !notification?.body) {
      console.error("بيانات الإشعار غير كافية");
      return new Response(
        JSON.stringify({ error: 'يجب توفير عنوان ومحتوى للإشعار' }),
        {
          status: 400,
          headers: headers,
        }
      );
    }

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
          headers: headers,
        }
      );
    }

    // إذا لم تم توفير رموز مباشرة، استخدم القائمة كما هي
    let targetTokens = tokens || [];

    // إذا لم يوجد رموز، لا يوجد داعي للمتابعة
    if (targetTokens.length === 0) {
      console.log("لا يوجد رموز لإرسال الإشعارات إليها");
      return new Response(
        JSON.stringify({ success: true, message: 'لا يوجد رموز مستهدفة', sentCount: 0 }),
        {
          headers: headers,
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
      tokens: targetTokens
    };
    
    console.log(`محاولة إرسال الإشعارات إلى ${targetTokens.length} رمز...`);
    
    try {
      // إرسال الإشعار باستخدام Firebase
      const response = await firebaseAdmin.messaging().sendMulticast(message);
      console.log(`تم إرسال الإشعار بنجاح: ${response.successCount} نجاح، ${response.failureCount} فشل`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `تم إرسال ${response.successCount} من ${targetTokens.length} إشعارات بنجاح`,
          sentCount: response.successCount
        }),
        {
          headers: headers,
        }
      );
    } catch (error) {
      console.error('خطأ في إرسال الإشعارات عبر Firebase:', error);
      return new Response(
        JSON.stringify({ error: 'خطأ في إرسال الإشعارات', details: error.message }),
        {
          status: 500,
          headers: headers,
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
