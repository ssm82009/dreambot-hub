
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

    // Check each function individually and create only if missing
    // This prevents errors when functions already exist
    
    const functions = [
      { name: 'check_fcm_token_exists', rpcName: 'create_check_fcm_token_exists' },
      { name: 'insert_fcm_token', rpcName: 'create_insert_fcm_token' },
      { name: 'delete_fcm_token', rpcName: 'create_delete_fcm_token' },
      { name: 'delete_all_user_fcm_tokens', rpcName: 'create_delete_all_user_fcm_tokens' }
    ];
    
    const results = [];
    
    for (const func of functions) {
      try {
        const { data: checkData } = await supabaseAdmin.rpc('check_function_exists', { 
          function_name: func.name 
        }).maybeSingle();
        
        if (!checkData?.exists) {
          console.log(`Creating function: ${func.name}`);
          const { error } = await supabaseAdmin.rpc(func.rpcName);
          
          if (error) {
            console.warn(`Warning creating ${func.name}: ${error.message}`);
            results.push({ function: func.name, status: 'error', message: error.message });
          } else {
            results.push({ function: func.name, status: 'created' });
          }
        } else {
          console.log(`Function ${func.name} already exists, skipping`);
          results.push({ function: func.name, status: 'exists' });
        }
      } catch (funcError) {
        console.warn(`Error checking/creating ${func.name}:`, funcError);
        results.push({ function: func.name, status: 'error', message: funcError.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'FCM functions creation completed', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in create-fcm-functions:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
