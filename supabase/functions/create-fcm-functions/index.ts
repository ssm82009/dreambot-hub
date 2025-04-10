
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { error: check_fcm_error } = await supabaseAdmin.rpc('create_check_fcm_token_exists');
    const { error: insert_fcm_error } = await supabaseAdmin.rpc('create_insert_fcm_token');
    const { error: delete_fcm_error } = await supabaseAdmin.rpc('create_delete_fcm_token');
    const { error: delete_all_error } = await supabaseAdmin.rpc('create_delete_all_user_fcm_tokens');

    if (check_fcm_error || insert_fcm_error || delete_fcm_error || delete_all_error) {
      throw new Error('Error creating FCM functions');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'FCM functions created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
