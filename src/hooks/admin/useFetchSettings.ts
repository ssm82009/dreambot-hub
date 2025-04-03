
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';

export const useFetchSettings = () => {
  const {
    setDbLoading,
    setAiSettingsForm,
    setInterpretationSettingsForm,
    setPricingSettingsForm,
    setPaymentSettingsForm,
    setThemeSettingsForm,
    setNavLinks
  } = useAdmin();

  const fetchAllSettings = async () => {
    setDbLoading(true);
    try {
      // Fetch AI settings
      const { data: aiData, error: aiError } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (aiError) {
        console.error("خطأ في جلب إعدادات الذكاء الاصطناعي:", aiError);
      } else if (aiData) {
        setAiSettingsForm({
          provider: aiData.provider,
          apiKey: aiData.api_key,
          model: aiData.model
        });
      }

      // Fetch interpretation settings
      const { data: interpretationData, error: interpretationError } = await supabase
        .from('interpretation_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (interpretationError) {
        console.error("خطأ في جلب إعدادات التفسير:", interpretationError);
      } else if (interpretationData) {
        setInterpretationSettingsForm({
          maxInputWords: interpretationData.max_input_words,
          minOutputWords: interpretationData.min_output_words,
          maxOutputWords: interpretationData.max_output_words,
          systemInstructions: interpretationData.system_instructions
        });
      }

      // Fetch pricing settings
      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (pricingError) {
        console.error("خطأ في جلب إعدادات الخطط والأسعار:", pricingError);
      } else if (pricingData) {
        setPricingSettingsForm({
          freePlan: {
            price: Number(pricingData.free_plan_price),
            interpretationsPerMonth: pricingData.free_plan_interpretations,
            features: pricingData.free_plan_features
          },
          premiumPlan: {
            price: Number(pricingData.premium_plan_price),
            interpretationsPerMonth: pricingData.premium_plan_interpretations,
            features: pricingData.premium_plan_features
          },
          proPlan: {
            price: Number(pricingData.pro_plan_price),
            interpretationsPerMonth: pricingData.pro_plan_interpretations,
            features: pricingData.pro_plan_features
          }
        });
      }

      // Fetch payment settings
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (paymentError) {
        console.error("خطأ في جلب إعدادات بوابات الدفع:", paymentError);
      } else if (paymentData) {
        setPaymentSettingsForm({
          paylink: {
            enabled: paymentData.paylink_enabled,
            apiKey: paymentData.paylink_api_key || "",
            secretKey: paymentData.paylink_secret_key || ""
          },
          paypal: {
            enabled: paymentData.paypal_enabled,
            clientId: paymentData.paypal_client_id || "",
            secret: paymentData.paypal_secret || "",
            sandbox: paymentData.paypal_sandbox
          }
        });
      }

      // Fetch theme settings
      const { data: themeData, error: themeError } = await supabase
        .from('theme_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (themeError) {
        console.error("خطأ في جلب إعدادات المظهر:", themeError);
      } else if (themeData) {
        setThemeSettingsForm({
          primaryColor: themeData.primary_color,
          buttonColor: themeData.button_color,
          textColor: themeData.text_color,
          backgroundColor: themeData.background_color,
          logoText: themeData.logo_text,
          logoFontSize: themeData.logo_font_size,
          headerColor: themeData.header_color,
          footerColor: themeData.footer_color,
          footerText: themeData.footer_text,
          socialLinks: {
            twitter: themeData.twitter_link || "",
            facebook: themeData.facebook_link || "",
            instagram: themeData.instagram_link || ""
          }
        });
      }

      // Fetch navbar links
      const { data: navLinksData, error: navLinksError } = await supabase
        .from('navbar_links')
        .select('*')
        .order('order', { ascending: true });
      
      if (navLinksError) {
        console.error("خطأ في جلب روابط شريط التنقل:", navLinksError);
      } else {
        setNavLinks(navLinksData || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الإعدادات:", error);
    } finally {
      setDbLoading(false);
    }
  };

  return { fetchAllSettings };
};
