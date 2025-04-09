
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as jose from 'https://deno.land/x/jose@v4.13.1/index.ts';

interface ServiceAccountPayload {
  clientEmail: string;
  privateKey: string;
  projectId: string;
}

// تعريف رؤوس CORS - تأكد من شمولها لجميع الرؤوس المطلوبة
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
  if (req.method === 'OPTIONS') {
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
    console.log('Processing request body');
    // استخراج البيانات من جسم الطلب
    const payload = await req.json() as ServiceAccountPayload;
    const { clientEmail, privateKey, projectId } = payload;

    // التحقق من وجود جميع البيانات المطلوبة
    if (!clientEmail || !privateKey || !projectId) {
      console.log('Missing required fields in request');
      return new Response(JSON.stringify({ error: 'بيانات مفقودة، يجب توفير clientEmail و privateKey و projectId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating JWT for OAuth request');
    // إنشاء JWT لتوقيع طلب الحصول على رمز الوصول
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // صلاحية لمدة ساعة

    const privateKeyFixed = privateKey.replace(/\\n/g, '\n');

    // إنشاء وتوقيع JWT
    const jwt = await new jose.SignJWT({
      scope: 'https://www.googleapis.com/auth/firebase.messaging'
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(clientEmail)
      .setSubject(clientEmail)
      .setAudience('https://oauth2.googleapis.com/token')
      .setIssuedAt(now)
      .setExpirationTime(expiry)
      .sign(await jose.importPKCS8(privateKeyFixed, 'RS256'));

    console.log('Sending request to Google OAuth');
    // إرسال طلب للحصول على رمز الوصول من Google OAuth
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('خطأ في الحصول على رمز الوصول:', errorData);
      return new Response(JSON.stringify({ error: `خطأ في الحصول على رمز الوصول: ${errorData}` }), {
        status: tokenResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');
    
    return new Response(JSON.stringify(tokenData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return new Response(JSON.stringify({ error: `خطأ في معالجة الطلب: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
