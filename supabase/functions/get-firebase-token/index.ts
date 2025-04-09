
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as jose from 'https://deno.land/x/jose@v4.13.1/index.ts';

interface ServiceAccountPayload {
  clientEmail: string;
  privateKey: string;
  projectId: string;
}

serve(async (req) => {
  // التحقق من وجود جسم الطلب
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'طريقة غير مدعومة، استخدم POST' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // استخراج البيانات من جسم الطلب
    const payload = await req.json() as ServiceAccountPayload;
    const { clientEmail, privateKey, projectId } = payload;

    // التحقق من وجود جميع البيانات المطلوبة
    if (!clientEmail || !privateKey || !projectId) {
      return new Response(JSON.stringify({ error: 'بيانات مفقودة، يجب توفير clientEmail و privateKey و projectId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    
    return new Response(JSON.stringify(tokenData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return new Response(JSON.stringify({ error: `خطأ في معالجة الطلب: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
