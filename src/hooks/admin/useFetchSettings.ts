import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { initialThemeSettings, initialSeoSettings } from '@/contexts/admin/initialState';

export const useFetchSettings = () => {
  const {
    setDbLoading,
    setAiSettingsForm,
    setInterpretationSettingsForm,
    setPricingSettingsForm,
    setPaymentSettingsForm,
    setThemeSettingsForm,
    setSeoSettingsForm,
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
          freePlanName: pricingData.free_plan_name || 'المجاني',
          freePlanPrice: Number(pricingData.free_plan_price),
          freePlanInterpretations: pricingData.free_plan_interpretations,
          freePlanFeatures: pricingData.free_plan_features,
          premiumPlanName: pricingData.premium_plan_name || 'المميز',
          premiumPlanPrice: Number(pricingData.premium_plan_price),
          premiumPlanInterpretations: pricingData.premium_plan_interpretations,
          premiumPlanFeatures: pricingData.premium_plan_features,
          proPlanName: pricingData.pro_plan_name || 'الاحترافي',
          proPlanPrice: Number(pricingData.pro_plan_price),
          proPlanInterpretations: pricingData.pro_plan_interpretations,
          proPlanFeatures: pricingData.pro_plan_features
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
          paylinkEnabled: paymentData.paylink_enabled,
          paylinkApiKey: paymentData.paylink_api_key || "",
          paylinkSecretKey: paymentData.paylink_secret_key || "",
          paypalEnabled: paymentData.paypal_enabled,
          paypalClientId: paymentData.paypal_client_id || "",
          paypalSecret: paymentData.paypal_secret || "",
          paypalSandbox: paymentData.paypal_sandbox
        });
      }

      // Fetch theme settings and SEO settings (from the same table)
      const { data: themeData, error: themeError } = await supabase
        .from('theme_settings')
        .select(`
          id, primary_color, button_color, text_color, background_color, 
          logo_text, logo_font_size, header_color, footer_color, footer_text, 
          twitter_link, facebook_link, instagram_link, slug, created_at, updated_at,
          meta_title, meta_description, keywords, enable_sitemap, enable_robots_txt,
          enable_canonical_urls, enable_open_graph, enable_twitter_cards,
          google_analytics_id, custom_head_tags
        `)
        .limit(1)
        .single();
      
      if (themeError) {
        console.error("خطأ في جلب إعدادات المظهر:", themeError);
        // Use default theme settings if there's an error
        setThemeSettingsForm(initialThemeSettings);
        setSeoSettingsForm(initialSeoSettings);
      } else if (themeData) {
        // Update theme settings
        setThemeSettingsForm({
          primaryColor: themeData.primary_color || initialThemeSettings.primaryColor,
          buttonColor: themeData.button_color || initialThemeSettings.buttonColor,
          textColor: themeData.text_color || initialThemeSettings.textColor,
          backgroundColor: themeData.background_color || initialThemeSettings.backgroundColor,
          logoText: themeData.logo_text || initialThemeSettings.logoText,
          logoFontSize: themeData.logo_font_size || initialThemeSettings.logoFontSize,
          headerColor: themeData.header_color || initialThemeSettings.headerColor,
          footerColor: themeData.footer_color || initialThemeSettings.footerColor,
          footerText: themeData.footer_text || initialThemeSettings.footerText,
          twitterLink: themeData.twitter_link || "",
          facebookLink: themeData.facebook_link || "",
          instagramLink: themeData.instagram_link || "",
          slug: themeData.slug || initialThemeSettings.slug
        });
        
        // Update SEO settings from the same theme_settings table
        setSeoSettingsForm({
          metaTitle: themeData.meta_title || initialSeoSettings.metaTitle,
          metaDescription: themeData.meta_description || initialSeoSettings.metaDescription,
          keywords: themeData.keywords || initialSeoSettings.keywords,
          slug: themeData.slug || initialSeoSettings.slug,
          enableSitemap: themeData.enable_sitemap ?? initialSeoSettings.enableSitemap,
          enableRobotsTxt: themeData.enable_robots_txt ?? initialSeoSettings.enableRobotsTxt,
          enableCanonicalUrls: themeData.enable_canonical_urls ?? initialSeoSettings.enableCanonicalUrls,
          enableOpenGraph: themeData.enable_open_graph ?? initialSeoSettings.enableOpenGraph,
          enableTwitterCards: themeData.enable_twitter_cards ?? initialSeoSettings.enableTwitterCards,
          googleAnalyticsId: themeData.google_analytics_id || initialSeoSettings.googleAnalyticsId,
          customHeadTags: themeData.custom_head_tags || initialSeoSettings.customHeadTags
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
