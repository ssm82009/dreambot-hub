
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Updated to use the new Supabase URL and key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://31.220.87.11:8001';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseKey,
      { auth: { persistSession: false } }
    );

    const { action } = await req.json();
    
    if (action === 'getSubscriberCount') {
      // جلب إحصائيات OneSignal
      const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
      const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
      
      console.log('OneSignal credentials:', { 
        appIdExists: !!oneSignalAppId, 
        apiKeyLength: oneSignalApiKey ? oneSignalApiKey.length : 0,
        appIdValue: oneSignalAppId ? oneSignalAppId.substring(0, 5) + '...' : 'undefined',
        supabaseUrl,
        supabaseKey: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'
      });
      
      // إذا كانت المفاتيح غير موجودة، يمكننا إرجاع قيمة افتراضية بدلاً من رمي خطأ
      if (!oneSignalAppId || !oneSignalApiKey) {
        console.error('OneSignal credentials are missing, returning default value');
        return new Response(
          JSON.stringify({ 
            count: 0, 
            warning: 'OneSignal credentials missing, showing default count',
            debug: {
              appIdExists: !!oneSignalAppId,
              apiKeyExists: !!oneSignalApiKey,
              envVars: Object.keys(Deno.env.toObject()).filter(key => key.includes('SIGNAL') || key.includes('ONE'))
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      try {
        // استدعاء API الخاص بـ OneSignal للحصول على إحصائيات المستخدمين
        console.log(`Fetching OneSignal stats with app_id=${oneSignalAppId?.substring(0, 5)}...`);
        
        const response = await fetch(`https://onesignal.com/api/v1/players?app_id=${oneSignalAppId}&limit=1`, {
          headers: {
            'Authorization': `Basic ${oneSignalApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OneSignal API error:', response.status, errorText);
          
          // إرجاع استجابة مع رمز حالة ناجح ولكن مع رسالة خطأ
          return new Response(
            JSON.stringify({ 
              count: 0, 
              error: `OneSignal API error: ${response.status}`,
              debug: errorText
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        const data = await response.json();
        const totalCount = data.total_count || 0;
        
        console.log('OneSignal subscribers count:', totalCount);
        
        return new Response(
          JSON.stringify({ count: totalCount }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (fetchError) {
        console.error('Error fetching data from OneSignal:', fetchError);
        
        // إرجاع استجابة مع رمز حالة ناجح ولكن مع رسالة خطأ
        return new Response(
          JSON.stringify({ 
            count: 0, 
            error: fetchError.message || 'Error connecting to OneSignal API'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action', count: 0 }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in get-onesignal-stats:', error);
    
    // إرجاع استجابة ناجحة (200) مع تفاصيل الخطأ في المحتوى
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: Deno.env.get('DENO_ENV') === 'development' ? error.stack : undefined,
        count: 0 // إضافة قيمة افتراضية للعدد حتى لا ينكسر واجهة المستخدم
      }),
      { 
        status: 200, // تغيير من 500 إلى 200
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
