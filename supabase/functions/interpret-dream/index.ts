
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// معالجة طلبات CORS
async function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

serve(async (req) => {
  // معالجة CORS إذا كان الطلب من نوع OPTIONS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // استخراج بيانات الحلم من الطلب
    const { dreamText } = await req.json();
    if (!dreamText) {
      return new Response(
        JSON.stringify({ error: 'يرجى تقديم نص الحلم' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إنشاء اتصال Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // الحصول على إعدادات الذكاء الاصطناعي
    const { data: aiSettings, error: aiError } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .single();

    if (aiError) {
      console.error('خطأ في استرجاع إعدادات الذكاء الاصطناعي:', aiError);
      return new Response(
        JSON.stringify({ error: 'خطأ في استرجاع إعدادات الذكاء الاصطناعي' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // الحصول على إعدادات التفسير
    const { data: interpretationSettings, error: interpretationError } = await supabase
      .from('interpretation_settings')
      .select('*')
      .limit(1)
      .single();

    if (interpretationError) {
      console.error('خطأ في استرجاع إعدادات التفسير:', interpretationError);
      return new Response(
        JSON.stringify({ error: 'خطأ في استرجاع إعدادات التفسير' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // الحصول على رموز الأحلام لتحسين التفسير
    const { data: dreamSymbols, error: symbolsError } = await supabase
      .from('dream_symbols')
      .select('*');

    if (symbolsError) {
      console.error('خطأ في استرجاع رموز الأحلام:', symbolsError);
    }

    // إعداد سياق التفسير مع رموز الأحلام
    let symbolsContext = '';
    if (dreamSymbols && dreamSymbols.length > 0) {
      symbolsContext = 'رموز الأحلام المهمة ومعانيها:\n';
      dreamSymbols.forEach(symbol => {
        if (dreamText.includes(symbol.symbol)) {
          symbolsContext += `- ${symbol.symbol}: ${symbol.interpretation}\n`;
        }
      });
    }

    // إنشاء طلب التفسير للذكاء الاصطناعي
    let aiResponse;
    if (aiSettings?.provider === 'together') {
      // استخدام Together.ai
      console.log('استخدام مزود Together.ai للتفسير');
      const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.api_key}`
        },
        body: JSON.stringify({
          model: aiSettings.model || 'meta-llama/Llama-3-8b-chat-hf',
          messages: [
            {
              role: 'system',
              content: interpretationSettings.system_instructions
            },
            {
              role: 'user',
              content: `${symbolsContext ? symbolsContext + '\n\n' : ''}الحلم: ${dreamText}\n\nقم بتفسير هذا الحلم بدقة ووضوح.`
            }
          ],
          max_tokens: interpretationSettings.max_output_words * 3, // تقريبي: الكلمة الواحدة تعادل حوالي 3 tokens
          temperature: 0.7
        })
      });

      const togetherData = await togetherResponse.json();
      if (togetherData.error) {
        console.error('خطأ من Together.ai:', togetherData.error);
        return new Response(
          JSON.stringify({ error: `خطأ من مزود الذكاء الاصطناعي: ${togetherData.error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      aiResponse = togetherData.choices[0]?.message?.content;
    } else if (aiSettings?.provider === 'openai') {
      // استخدام OpenAI
      console.log('استخدام مزود OpenAI للتفسير');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiSettings.api_key}`
        },
        body: JSON.stringify({
          model: aiSettings.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: interpretationSettings.system_instructions
            },
            {
              role: 'user',
              content: `${symbolsContext ? symbolsContext + '\n\n' : ''}الحلم: ${dreamText}\n\nقم بتفسير هذا الحلم بدقة ووضوح.`
            }
          ],
          max_tokens: interpretationSettings.max_output_words * 4,
          temperature: 0.7
        })
      });

      const openaiData = await openaiResponse.json();
      if (openaiData.error) {
        console.error('خطأ من OpenAI:', openaiData.error);
        return new Response(
          JSON.stringify({ error: `خطأ من مزود الذكاء الاصطناعي: ${openaiData.error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      aiResponse = openaiData.choices[0]?.message?.content;
    } else {
      // استخدام طريقة افتراضية بسيطة
      console.log('مزود الذكاء الاصطناعي غير مكوّن بشكل صحيح، استخدام تفسير افتراضي');
      
      // بدلاً من إرجاع تفسير افتراضي ثابت، نجرب استخدام رموز الأحلام
      if (dreamSymbols && dreamSymbols.length > 0) {
        let interpretation = 'تفسير الحلم استناداً إلى الرموز الموجودة:\n\n';
        let foundSymbols = false;
        
        dreamSymbols.forEach(symbol => {
          if (dreamText.includes(symbol.symbol)) {
            interpretation += `${symbol.symbol}: ${symbol.interpretation}\n\n`;
            foundSymbols = true;
          }
        });
        
        if (foundSymbols) {
          aiResponse = interpretation + "\n\nملاحظة: هذا التفسير بسيط ويعتمد على المطابقة المباشرة للرموز. للحصول على تفسير أكثر دقة، يرجى تكوين مزود ذكاء اصطناعي.";
        } else {
          aiResponse = "لم نتمكن من العثور على رموز معروفة في حلمك. للحصول على تفسير أفضل، يرجى تكوين مزود ذكاء اصطناعي أو إضافة المزيد من رموز الأحلام.";
        }
      } else {
        aiResponse = "لتفعيل تفسير الأحلام الذكي، يرجى تكوين مزود الذكاء الاصطناعي في لوحة الإدارة أو إضافة رموز أحلام للتفسير.";
      }
    }

    console.log('تم الحصول على تفسير الحلم بنجاح');
    
    return new Response(
      JSON.stringify({ interpretation: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('خطأ في معالجة طلب تفسير الحلم:', error);
    return new Response(
      JSON.stringify({ error: `خطأ في معالجة الطلب: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
