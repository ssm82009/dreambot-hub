
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
  try {
    // معالجة CORS إذا كان الطلب من نوع OPTIONS
    const corsResponse = await handleCors(req);
    if (corsResponse) return corsResponse;

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

    // التحقق من المستخدم الحالي
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'يجب توفير رمز المصادقة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من صحة الجلسة
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      console.error('خطأ في التحقق من المستخدم:', userError);
      return new Response(
        JSON.stringify({ error: 'جلسة غير صالحة، يرجى إعادة تسجيل الدخول' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من حدود الاستخدام
    const userId = user.id;

    // 1. الحصول على بيانات المستخدم واشتراكه
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userDataError) {
      console.error('خطأ في استرجاع بيانات المستخدم:', userDataError);
      return new Response(
        JSON.stringify({ error: 'خطأ في استرجاع بيانات المستخدم' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. الحصول على إعدادات التسعير
    const { data: pricingSettings, error: pricingError } = await supabase
      .from('pricing_settings')
      .select('*')
      .limit(1)
      .single();

    if (pricingError) {
      console.error('خطأ في استرجاع إعدادات التسعير:', pricingError);
      return new Response(
        JSON.stringify({ error: 'خطأ في استرجاع إعدادات التسعير' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. الحصول على عدد التفسيرات المستخدمة
    const { count: usedInterpretations, error: countError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('خطأ في حساب عدد التفسيرات:', countError);
      return new Response(
        JSON.stringify({ error: 'خطأ في حساب عدد التفسيرات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. التحقق من تجاوز الحد
    let totalAllowed: number;

    if (!userData.subscription_type || userData.subscription_type === 'free') {
      totalAllowed = pricingSettings.free_plan_interpretations;
    } else if (userData.subscription_type === 'premium') {
      totalAllowed = pricingSettings.premium_plan_interpretations;
    } else if (userData.subscription_type === 'pro') {
      totalAllowed = pricingSettings.pro_plan_interpretations;
    } else if (userData.subscription_type === 'المميز') {
      totalAllowed = pricingSettings.premium_plan_interpretations;
    } else if (userData.subscription_type === 'المفسر المتميز') {
      totalAllowed = pricingSettings.premium_plan_interpretations;
    } else if (userData.subscription_type === 'المفسر الخبير') {
      totalAllowed = pricingSettings.pro_plan_interpretations;
    } else {
      totalAllowed = pricingSettings.free_plan_interpretations;
    }

    // إذا كانت القيمة -1 فهذا يعني غير محدود
    if (totalAllowed !== -1 && usedInterpretations && usedInterpretations >= totalAllowed) {
      return new Response(
        JSON.stringify({ error: 'لقد استنفدت الحد المسموح به من التفسيرات. يرجى ترقية اشتراكك للحصول على المزيد.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // الحصول على إعدادات الذكاء الاصطناعي
    const { data: aiSettings, error: aiError } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

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
      .maybeSingle();

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

    // تعزيز تعليمات النظام لضمان استخدام اللغة العربية
    const systemInstructions = interpretationSettings?.system_instructions || 'أنت مفسر أحلام خبير. يجب أن تقدم تفسيرات دقيقة وشاملة استناداً إلى المراجع الإسلامية والعلمية.';
    const enhancedInstructions = `${systemInstructions}\n\nمهم جداً: يجب أن يكون تفسيرك باللغة العربية فقط. لا تستخدم أي لغة أخرى في إجابتك.`;

    // التأكد من وجود مزود للذكاء الاصطناعي وإعدادات صالحة
    const provider = aiSettings?.provider || 'default';
    const apiKey = aiSettings?.api_key || '';
    const model = aiSettings?.model || '';

    console.log(`محاولة استخدام مزود ${provider} للتفسير مع نموذج ${model}`);

    // القائمة المزودين المتاحة للمحاولة بالترتيب
    const providers = [
      { name: provider, key: apiKey, model: model }, // المزود الأساسي من الإعدادات
      { name: 'together', key: apiKey, model: 'meta-llama/Llama-3-8b-chat-hf' }, // احتياطي أول - Together.ai
      { name: 'openai', key: apiKey, model: 'gpt-4o-mini' }, // احتياطي ثاني - OpenAI
      { name: 'symbols', key: '', model: '' } // استخدام رموز الأحلام فقط كحل أخير
    ];

    // إنشاء طلب التفسير للذكاء الاصطناعي
    let aiResponse = null;
    let error = null;
    
    // محاولة كل مزود في القائمة حتى تنجح إحدى المحاولات
    for (const providerConfig of providers) {
      if (aiResponse) break; // إذا كان هناك استجابة ناجحة، توقف عن المحاولة
      
      try {
        if (providerConfig.name === 'together' && providerConfig.key) {
          console.log(`محاولة استخدام مزود Together.ai مع النموذج ${providerConfig.model}`);
          
          const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${providerConfig.key}`
            },
            body: JSON.stringify({
              model: providerConfig.model,
              messages: [
                {
                  role: 'system',
                  content: enhancedInstructions
                },
                {
                  role: 'user',
                  content: `${symbolsContext ? symbolsContext + '\n\n' : ''}الحلم: ${dreamText}\n\nقم بتفسير هذا الحلم بدقة ووضوح باللغة العربية.`
                }
              ],
              max_tokens: (interpretationSettings?.max_output_words || 1000) * 3,
              temperature: 0.7
            })
          });

          if (!togetherResponse.ok) {
            const errorData = await togetherResponse.text();
            console.error(`خطأ من Together.ai: ${togetherResponse.status} - ${errorData}`);
            throw new Error(`خطأ من Together.ai: ${togetherResponse.status} - ${errorData}`);
          }

          const togetherData = await togetherResponse.json();
          aiResponse = togetherData.choices[0]?.message?.content;
          if (aiResponse) console.log('تم الحصول على تفسير بنجاح من Together.ai');
        } 
        else if (providerConfig.name === 'openai' && providerConfig.key) {
          console.log(`محاولة استخدام مزود OpenAI مع النموذج ${providerConfig.model || 'gpt-4o-mini'}`);
          
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${providerConfig.key}`
            },
            body: JSON.stringify({
              model: providerConfig.model || 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: enhancedInstructions
                },
                {
                  role: 'user',
                  content: `${symbolsContext ? symbolsContext + '\n\n' : ''}الحلم: ${dreamText}\n\nقم بتفسير هذا الحلم بدقة ووضوح باللغة العربية.`
                }
              ],
              max_tokens: (interpretationSettings?.max_output_words || 1000) * 4,
              temperature: 0.7
            }),
            // الإعداد التالي يعطي المزيد من الوقت للاستجابة قبل انتهاء المهلة
            signal: AbortSignal.timeout(20000)
          });

          if (!openaiResponse.ok) {
            const errorData = await openaiResponse.text();
            console.error(`خطأ من OpenAI: ${openaiResponse.status} - ${errorData}`);
            throw new Error(`خطأ من OpenAI: ${openaiResponse.status} - ${errorData}`);
          }

          const openaiData = await openaiResponse.json();
          aiResponse = openaiData.choices[0]?.message?.content;
          if (aiResponse) console.log('تم الحصول على تفسير بنجاح من OpenAI');
        }
        else if (providerConfig.name === 'symbols') {
          console.log('استخدام رموز الأحلام كمصدر أخير للتفسير');
          
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
              aiResponse = interpretation + "\n\nملاحظة: هذا التفسير بسيط ويعتمد على المطابقة المباشرة للرموز. للحصول على تفسير أكثر دقة، يرجى التحقق من مفتاح API الخاص بك أو تكوين مزود ذكاء اصطناعي آخر.";
              console.log('تم إنشاء تفسير باستخدام رموز الأحلام');
            } else {
              aiResponse = "لم نتمكن من العثور على رموز معروفة في حلمك. للحصول على تفسير أفضل، يرجى التحقق من مفتاح API الخاص بك أو إضافة المزيد من رموز الأحلام.";
              console.log('لم يتم العثور على رموز مطابقة في الحلم');
            }
          } else {
            aiResponse = "لتفعيل تفسير الأحلام الذكي، يرجى تكوين مزود الذكاء الاصطناعي في لوحة الإدارة أو إضافة رموز أحلام للتفسير، والتأكد من صحة مفتاح API الخاص بك.";
            console.log('لم يتم العثور على رموز للأحلام في قاعدة البيانات');
          }
        }
      } catch (err) {
        console.error(`خطأ في استدعاء ${providerConfig.name}:`, err);
        error = err;
        // استمر في الحلقة للمحاولة مع المزود التالي
      }
    }

    if (!aiResponse) {
      // إذا لم ينجح أي مزود، استخدم رسالة خطأ تفصيلية
      let errorMessage = "لم نتمكن من الحصول على تفسير في هذا الوقت. ";
      
      if (error) {
        // تحقق من نوع الخطأ لتقديم رسائل محددة
        if (error.message && error.message.includes("insufficient_quota")) {
          errorMessage += "لقد تجاوزت حد استخدام API الخاص بك. يرجى التحقق من حسابك أو استخدام مفتاح API آخر.";
        } else if (error.message && error.message.includes("invalid")) {
          errorMessage += "مفتاح API غير صالح. يرجى التحقق من صحة المفتاح في إعدادات لوحة التحكم.";
        } else if (error.message && error.message.includes("timeout")) {
          errorMessage += "انتهت مهلة اتصال API. يرجى المحاولة مرة أخرى لاحقًا.";
        } else {
          errorMessage += "يرجى التحقق من إعدادات مزود الذكاء الاصطناعي ومفتاح API الخاص بك.";
        }
      } else {
        errorMessage += "يرجى التحقق من إعدادات مزود الذكاء الاصطناعي في لوحة التحكم.";
      }
      
      throw new Error(errorMessage);
    }

    // حفظ سجل الحلم في قاعدة البيانات
    try {
      if (userId && dreamText) {
        // استخراج الكلمات المفتاحية
        const commonKeywords = ['ماء', 'طيران', 'سقوط', 'موت', 'مطاردة', 'سفر', 'بيت', 'أسنان', 'فقدان', 'قطة', 'كلب', 'ثعبان', 'طفل', 'امتحان', 'تأخر', 'نجاح', 'فشل', 'زواج', 'مطر', 'شمس', 'قمر', 'نجوم'];
        const tags = commonKeywords.filter(keyword => dreamText.includes(keyword));

        // إضافة سجل الحلم
        const { error } = await supabase
          .from('dreams')
          .insert({
            dream_text: dreamText,
            interpretation: aiResponse,
            user_id: userId,
            tags: tags
          });

        if (error) {
          console.error('خطأ في حفظ الحلم في قاعدة البيانات:', error);
        } else {
          console.log('تم حفظ الحلم والتفسير بنجاح في قاعدة البيانات');
        }
      }
    } catch (dbError) {
      console.error('خطأ في حفظ الحلم:', dbError);
      // نستمر بالتنفيذ حتى لو فشل الحفظ في قاعدة البيانات
    }

    console.log('تم الحصول على تفسير الحلم بنجاح');
    
    return new Response(
      JSON.stringify({ interpretation: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('خطأ في معالجة طلب تفسير الحلم:', error);
    
    // رسالة خطأ مفيدة لواجهة المستخدم
    let userFriendlyError = "حدث خطأ أثناء تفسير الحلم. ";
    
    if (error.message) {
      if (error.message.includes("insufficient_quota")) {
        userFriendlyError += "لقد تجاوزت حد استخدام API الخاص بك. يرجى التحقق من حسابك أو استخدام مفتاح API آخر.";
      } else {
        userFriendlyError += error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: userFriendlyError,
        errorDetails: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
