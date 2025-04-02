
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Create a Supabase client with the Auth context of the function
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  try {
    // Set CORS headers for browser requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Content-Type": "application/json"
    };

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }
    
    // Get PayLink settings from database
    const { data, error } = await supabase
      .from('payment_settings')
      .select('paylink_enabled, paylink_api_key')
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching PayLink settings:", error);
      return new Response(
        JSON.stringify({ error: "Could not fetch PayLink settings", data: null }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    if (!data) {
      console.error("No PayLink settings found");
      return new Response(
        JSON.stringify({ error: "No PayLink settings found", data: { enabled: false, apiKey: "" } }),
        { headers: corsHeaders, status: 404 }
      );
    }
    
    // Return only the necessary data
    return new Response(
      JSON.stringify({ 
        data: { 
          enabled: data.paylink_enabled, 
          apiKey: data.paylink_api_key 
        }, 
        error: null 
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", data: null }),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        }, 
        status: 500 
      }
    );
  }
});
