
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
  auth: string;
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
    const { userId, endpoint, auth } = await req.json() as RequestBody;

    if (!userId || !endpoint || !auth) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير معرف المستخدم ونقطة النهاية وبيانات التخويل' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // التحقق من وجود جدول push_subscriptions
    const { error: tableError } = await supabaseAdmin.rpc(
      'check_table_exists', 
      { table_name: 'push_subscriptions' }
    );

    // إذا لم يكن الجدول موجودًا، قم بإنشائه
    if (tableError) {
      // إنشاء جدول اشتراكات الإشعارات إذا لم يكن موجودًا
      await supabaseAdmin.rpc('create_push_subscriptions_table');
    }

    // تخزين الاشتراك في قاعدة البيانات
    const { data, error } = await supabaseAdmin.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: endpoint,
      auth: auth,
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
    console.error('خطأ في تخزين اشتراك الإشعارات:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
