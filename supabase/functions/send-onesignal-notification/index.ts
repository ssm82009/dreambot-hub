
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

    // Get authorization headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      // This check can be disabled in development
      // return new Response(JSON.stringify({
      //   error: 'No authorization header provided'
      // }), {
      //   status: 401,
      //   headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      // });
    }

    // Get the request body
    const { notification, adminOnly, targetUsers, allUsers } = await req.json();
    
    // OneSignal credentials
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!oneSignalAppId || !oneSignalApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OneSignal credentials missing', 
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Prepare notification payload
    const payload: any = {
      app_id: oneSignalAppId,
      contents: { en: notification.body, ar: notification.body },
      headings: { en: notification.title, ar: notification.title },
      url: notification.url || '/',
      ttl: 86400,
    };

    // Set filters based on the request
    if (adminOnly) {
      // Get admin user IDs from the database
      const { data: adminUsers } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin');
      
      if (adminUsers && adminUsers.length > 0) {
        payload.include_external_user_ids = adminUsers.map(user => user.id);
      } else {
        return new Response(
          JSON.stringify({ 
            error: 'No admin users found', 
            success: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } else if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      payload.include_external_user_ids = targetUsers;
    } else if (allUsers) {
      // Send to all subscribed users
      payload.included_segments = ['Subscribed Users'];
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid target selection', 
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Send notification using OneSignal API
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${oneSignalApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('OneSignal API error:', response.status, responseData);
        return new Response(
          JSON.stringify({ 
            error: `OneSignal API error: ${response.status}`,
            details: responseData,
            success: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Log notification in database if needed
      // This can be implemented later if required

      return new Response(
        JSON.stringify({ 
          success: true,
          data: responseData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (fetchError) {
      console.error('Error sending OneSignal notification:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: fetchError.message || 'Error sending OneSignal notification',
          success: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in send-onesignal-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: Deno.env.get('DENO_ENV') === 'development' ? error.stack : undefined,
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
