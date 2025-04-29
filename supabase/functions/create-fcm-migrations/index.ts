
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Check if function already exists to avoid errors
    const { data: checkData } = await supabaseAdmin.rpc('check_function_exists', { 
      function_name: 'count_user_fcm_tokens' 
    }).maybeSingle();
    
    // Only create function if it doesn't exist
    if (!checkData?.exists) {
      // Create the count function
      const { error: countFnError } = await supabaseAdmin.rpc('create_count_user_fcm_tokens');
      
      if (countFnError) {
        throw new Error(`Error creating count function: ${countFnError.message}`);
      }
    } else {
      console.log("Count function already exists, skipping creation");
    }

    return new Response(
      JSON.stringify({ success: true, message: 'FCM migrations created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in create-fcm-migrations:", error);
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
