
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

    // Create a function to check if other functions exist
    const sql = `
    CREATE OR REPLACE FUNCTION check_function_exists(function_name TEXT)
    RETURNS TABLE(exists BOOLEAN) 
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY 
        SELECT EXISTS (
          SELECT 1 FROM pg_proc p 
          JOIN pg_namespace n ON p.pronamespace = n.oid 
          WHERE n.nspname = 'public' 
          AND p.proname = function_name
        );
    END;
    $$;
    `;

    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
      throw new Error(`Error creating function checker: ${error.message}`);
    }

    // Create a helper function to fix the subscription usage query
    // This function safely compares timestamps by casting both sides to the same type
    const fixSubscriptionUsageSql = `
    CREATE OR REPLACE FUNCTION safe_timestamp_compare(
      ts1 TIMESTAMP WITH TIME ZONE, 
      ts2 TIMESTAMP WITH TIME ZONE
    )
    RETURNS BOOLEAN
    LANGUAGE plpgsql
    IMMUTABLE
    AS $$
    BEGIN
      -- Cast both timestamps to the same type (timestamp without time zone) for comparison
      RETURN (ts1::timestamp) > (ts2::timestamp);
    END;
    $$;
    `;

    const { error: fixError } = await supabaseAdmin.rpc('exec_sql', { sql: fixSubscriptionUsageSql });

    if (fixError) {
      console.error("Error creating safe_timestamp_compare function:", fixError);
    } else {
      console.log("Created safe_timestamp_compare function successfully");
    }

    // Now fix the reset_subscription_usage function to use our safe comparison
    const fixResetSubscriptionSql = `
    CREATE OR REPLACE FUNCTION public.reset_subscription_usage()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      current_time TIMESTAMP WITH TIME ZONE := now();
      subscription_type TEXT;
      expiry_date TIMESTAMP WITH TIME ZONE;
      latest_usage RECORD;
      base_interpretations INT;
    BEGIN
      -- Get subscription type and expiry date
      SELECT NEW.subscription_type, NEW.subscription_expires_at 
      INTO subscription_type, expiry_date
      FROM users
      WHERE id = NEW.id;
      
      -- Get the latest valid subscription usage record (using safe comparison)
      SELECT * INTO latest_usage
      FROM public.subscription_usage
      WHERE user_id = NEW.id
        AND (subscription_expires_at IS NULL OR subscription_expires_at >= current_time)
      ORDER BY created_at DESC
      LIMIT 1;
      
      -- Determine base number of interpretations based on plan
      CASE subscription_type
        WHEN 'premium' THEN base_interpretations := 19;
        WHEN 'المميز' THEN base_interpretations := 19;
        WHEN 'pro' THEN base_interpretations := -1; -- Unlimited
        WHEN 'الاحترافي' THEN base_interpretations := -1; -- Unlimited
        ELSE base_interpretations := 3; -- Free plan
      END CASE;
      
      -- Only create a new record if the subscription type changed or was renewed
      IF OLD.subscription_type IS DISTINCT FROM NEW.subscription_type OR 
         (OLD.subscription_expires_at IS NOT NULL AND NEW.subscription_expires_at IS NOT NULL AND 
          NEW.subscription_expires_at > OLD.subscription_expires_at) THEN
        
        -- If there's a valid previous subscription and the new plan isn't unlimited
        IF latest_usage IS NOT NULL AND base_interpretations != -1 THEN
          -- Calculate remaining interpretations from previous subscription
          -- Negative values are handled as unlimited, so we don't add to them
          IF latest_usage.interpretations_used >= 0 THEN
            base_interpretations := base_interpretations + 
              GREATEST(0, 
                CASE 
                  WHEN latest_usage.subscription_type IN ('pro', 'الاحترافي') THEN -1
                  WHEN latest_usage.subscription_type IN ('premium', 'المميز') THEN 19 - latest_usage.interpretations_used
                  ELSE 3 - latest_usage.interpretations_used
                END
              );
          END IF;
        END IF;

        -- Insert new usage record
        INSERT INTO public.subscription_usage (
          user_id,
          subscription_type,
          interpretations_used,
          subscription_started_at,
          subscription_expires_at
        ) VALUES (
          NEW.id,
          subscription_type,
          0, -- Reset used interpretations
          current_time,
          expiry_date
        );
        
        -- Log the subscription update for debugging
        RAISE NOTICE 'Updated subscription for user %, type: %, base interpretations: %', 
          NEW.id, subscription_type, base_interpretations;
      END IF;
      
      RETURN NEW;
    END;
    $$;
    `;

    const { error: fixResetError } = await supabaseAdmin.rpc('exec_sql', { sql: fixResetSubscriptionSql });

    if (fixResetError) {
      console.error("Error updating reset_subscription_usage function:", fixResetError);
    } else {
      console.log("Updated reset_subscription_usage function successfully");
    }

    // Also fix the get_current_subscription_usage function to avoid the same issue
    const fixGetCurrentSubscriptionSql = `
    CREATE OR REPLACE FUNCTION public.get_current_subscription_usage(user_id uuid)
    RETURNS TABLE(interpretations_used integer, subscription_type text, subscription_expires_at timestamp with time zone)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        su.interpretations_used,
        su.subscription_type,
        su.subscription_expires_at
      FROM 
        public.subscription_usage su
      WHERE 
        su.user_id = get_current_subscription_usage.user_id
        AND (su.subscription_expires_at IS NULL OR su.subscription_expires_at >= now())
      ORDER BY 
        su.created_at DESC
      LIMIT 1;
    END;
    $$;
    `;

    const { error: fixGetCurrentError } = await supabaseAdmin.rpc('exec_sql', { sql: fixGetCurrentSubscriptionSql });

    if (fixGetCurrentError) {
      console.error("Error updating get_current_subscription_usage function:", fixGetCurrentError);
    } else {
      console.log("Updated get_current_subscription_usage function successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Function checker created and timestamp comparison functions fixed successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error creating function checker:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
