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

    // التحقق من وجود جدول fcm_tokens
    const { error: tableError } = await supabaseAdmin.rpc(
      'check_table_exists', 
      { table_name: 'fcm_tokens' }
    );

    // إذا لم يكن الجدول موجودًا، قم بإنشائه
    if (tableError) {
      console.log("إنشاء جدول fcm_tokens...");
      // إنشاء جدول للرموز
      await supabaseAdmin.rpc('create_fcm_tokens_table');
    }

    // تخزين الرمز في قاعدة البيانات
    const { data, error } = await supabaseAdmin.from('fcm_tokens').upsert({
      user_id: userId,
      token: token,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('خطأ في تخزين رمز FCM:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
