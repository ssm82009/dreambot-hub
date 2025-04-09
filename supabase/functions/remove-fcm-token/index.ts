
import { serve } from "std/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

// تعريف رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// تعريف واجهة البيانات
interface RequestBody {
  userId: string;
  token: string;
}

serve(async (req: Request) => {
  // معالجة طلبات CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // تحليل بيانات الطلب
    const { userId, token } = await req.json() as RequestBody;

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير معرف المستخدم ورمز FCM' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // حذف الرمز من قاعدة البيانات
    const { data, error } = await supabaseAdmin.from('fcm_tokens')
      .delete()
      .match({ user_id: userId, token });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('خطأ في حذف رمز FCM:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
