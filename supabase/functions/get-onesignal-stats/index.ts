
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { action } = await req.json();
    
    if (action === 'getSubscriberCount') {
      // جلب إحصائيات OneSignal
      const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
      const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
      
      if (!oneSignalAppId || !oneSignalApiKey) {
        throw new Error('OneSignal configuration is missing');
      }
      
      // استدعاء API الخاص بـ OneSignal للحصول على إحصائيات المستخدمين
      const response = await fetch(`https://onesignal.com/api/v1/players?app_id=${oneSignalAppId}&limit=1`, {
        headers: {
          'Authorization': `Basic ${oneSignalApiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OneSignal API error:', errorText);
        throw new Error(`OneSignal API error: ${response.status}`);
      }
      
      const data = await response.json();
      const totalCount = data.total_count || 0;
      
      console.log('OneSignal subscribers count:', totalCount);
      
      return new Response(
        JSON.stringify({ count: totalCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in get-onesignal-stats:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: Deno.env.get('DENO_ENV') === 'development' ? error.stack : undefined 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
