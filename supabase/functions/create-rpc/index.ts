
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { readFileSync } from "npm:fs";
import path from "npm:path";
import { dirname } from "npm:path";
import { fileURLToPath } from "npm:url";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const __dirname = dirname(fileURLToPath(import.meta.url));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Load SQL scripts
    const createFcmTokensTableSql = readFileSync(
      path.join(__dirname, 'sql', 'create_fcm_tokens_table.sql'),
      'utf8'
    );

    const createFirebaseConfigTableSql = readFileSync(
      path.join(__dirname, 'sql', 'create_firebase_config_table.sql'),
      'utf8'
    );

    const createCountFunctionSql = readFileSync(
      path.join(__dirname, 'sql', 'create_count_function.sql'),
      'utf8'
    );

    const createCountFcmTokensFunctionSql = readFileSync(
      path.join(__dirname, 'sql', 'create_count_fcm_tokens_function.sql'),
      'utf8'
    );

    // Execute SQL
    console.log('Creating FCM tokens table...');
    const { error: fcmTokensError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createFcmTokensTableSql
    });
    
    if (fcmTokensError) {
      console.error('Error creating FCM tokens table:', fcmTokensError);
      throw fcmTokensError;
    }

    console.log('Creating Firebase config table...');
    const { error: firebaseConfigError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createFirebaseConfigTableSql
    });
    
    if (firebaseConfigError) {
      console.error('Error creating Firebase config table:', firebaseConfigError);
      throw firebaseConfigError;
    }

    console.log('Creating count function...');
    const { error: countFunctionError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createCountFunctionSql
    });
    
    if (countFunctionError) {
      console.error('Error creating count function:', countFunctionError);
      throw countFunctionError;
    }

    console.log('Creating count_fcm_tokens function...');
    const { error: countFcmTokensFunctionError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: createCountFcmTokensFunctionSql
    });
    
    if (countFcmTokensFunctionError) {
      console.error('Error creating count_fcm_tokens function:', countFcmTokensFunctionError);
      throw countFcmTokensFunctionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'RPC functions and tables created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-rpc function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
