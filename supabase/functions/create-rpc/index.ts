
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Define the SQL for creating the count function
    const createCountFunctionSql = `
    -- Create a function to count push subscriptions
    CREATE OR REPLACE FUNCTION public.count_push_subscriptions()
    RETURNS INTEGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN (
        SELECT COUNT(*)::integer
        FROM public.push_subscriptions
      );
    END;
    $$;

    -- Grant usage to authenticated users
    GRANT EXECUTE ON FUNCTION public.count_push_subscriptions() TO authenticated;
    `;
    
    // Execute the SQL directly
    const { error } = await supabaseAdmin.withSystems().rpc('exec_sql', { sql: createCountFunctionSql });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, message: 'RPC function created successfully' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
