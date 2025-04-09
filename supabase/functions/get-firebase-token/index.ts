
// get-firebase-token Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "https://esm.sh/googleapis@105.0.0";

// تعريف رؤوس CORS بشكل كامل
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Accept',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  
  // معالجة طلبات CORS preflight بشكل صحيح
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // التحقق من وجود جسم الطلب
  if (req.method !== 'POST') {
    console.log(`Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ error: 'طريقة غير مدعومة، استخدم POST' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Processing request');
    
    // الحصول على مفتاح الحساب الخدمي من البيئة
    let serviceAccount;
    
    // نحاول استخدام البيانات من متغير البيئة أولاً
    const serviceAccountString = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY");
    if (serviceAccountString) {
      try {
        console.log('Using service account from environment variable');
        serviceAccount = JSON.parse(serviceAccountString);
      } catch (error) {
        console.error('Failed to parse service account from environment:', error);
      }
    }
    
    // إذا لم نجد متغير البيئة، نستخدم البيانات من الطلب
    if (!serviceAccount) {
      console.log('Using service account from request body');
      const payload = await req.json();
      const { clientEmail, privateKey, projectId } = payload;
      
      // التحقق من وجود جميع البيانات المطلوبة
      if (!clientEmail || !privateKey || !projectId) {
        console.log('Missing required fields in request');
        return new Response(JSON.stringify({ error: 'بيانات مفقودة، يجب توفير clientEmail و privateKey و projectId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // تحضير كائن الحساب الخدمي
      serviceAccount = {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
        project_id: projectId
      };
    }

    console.log('Initializing JWT client');
    
    // إنشاء عميل JWT لمصادقة Google
    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    console.log('Requesting OAuth token');
    
    // الحصول على رمز الوصول
    const tokenResponse = await jwtClient.authorize();
    
    if (!tokenResponse.access_token) {
      throw new Error('لم يتم الحصول على رمز وصول من Google');
    }
    
    console.log('Successfully obtained access token');
    
    // إرجاع رمز الوصول للعميل
    return new Response(JSON.stringify({
      access_token: tokenResponse.access_token,
      expires_in: tokenResponse.expiry_date,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'فشل الحصول على التوكن', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
