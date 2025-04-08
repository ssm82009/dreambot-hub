
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// تعريف رؤوس CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// تعريف واجهة البيانات
interface RequestBody {
  userId: string;
  endpoint: string;
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
    const { userId, endpoint } = await req.json() as RequestBody;

    if (!userId || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير معرف المستخدم ونقطة النهاية' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // حذف الاشتراك من قاعدة البيانات
    const { data, error } = await supabaseAdmin.from('push_subscriptions')
      .delete()
      .match({ user_id: userId, endpoint });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('خطأ في حذف اشتراك الإشعارات:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
