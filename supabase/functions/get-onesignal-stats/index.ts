
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    const { action } = await req.json();

    if (action === 'getSubscriberCount') {
      const count = await getSubscriberCount();
      return new Response(
        JSON.stringify({ 
          count,
          // Include debug info to help troubleshoot
          debug: {
            hasEnvVars: {
              apiKey: Boolean(Deno.env.get('ONESIGNAL_REST_API_KEY')),
              appId: Boolean(Deno.env.get('ONESIGNAL_APP_ID'))
            },
            timestamp: new Date().toISOString(),
            supabaseUrl: Deno.env.get('SUPABASE_URL') || 'https://supa.taweel.app'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action provided' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error in get-onesignal-stats:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        count: 0,
        debug: {
          errorStack: error.stack,
          hasEnvVars: {
            apiKey: Boolean(Deno.env.get('ONESIGNAL_REST_API_KEY')),
            appId: Boolean(Deno.env.get('ONESIGNAL_APP_ID'))
          },
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function getSubscriberCount(): Promise<number> {
  try {
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.warn('OneSignal credentials are missing');
      return 0;
    }

    // Fetch subscriber count from OneSignal API
    const response = await fetch(`https://onesignal.com/api/v1/players/count?app_id=${oneSignalAppId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${oneSignalApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from OneSignal API:', response.status, errorText);
      throw new Error(`OneSignal API error: ${response.status}`);
    }

    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return 0;
  }
}
