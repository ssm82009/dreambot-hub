
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// AiSettings form handler
export const useAiSettingsHandler = () => {
  const getAiSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('ai_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handleAiSettingsSubmit = async (data: {
    provider: string;
    apiKey: string;
    model: string;
  }) => {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({
          provider: data.provider,
          api_key: data.apiKey,
          model: data.model,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getAiSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات الذكاء الاصطناعي:", error);
        toast.error("حدث خطأ أثناء حفظ الإعدادات");
      } else {
        toast.success("تم حفظ إعدادات الذكاء الاصطناعي بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handleAiSettingsSubmit };
};

// InterpretationSettings form handler
export const useInterpretationSettingsHandler = () => {
  const getInterpretationSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('interpretation_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handleInterpretationSettingsSubmit = async (data: {
    maxInputWords: number;
    minOutputWords: number;
    maxOutputWords: number;
    systemInstructions: string;
  }) => {
    try {
      const { error } = await supabase
        .from('interpretation_settings')
        .update({
          max_input_words: data.maxInputWords,
          min_output_words: data.minOutputWords,
          max_output_words: data.maxOutputWords,
          system_instructions: data.systemInstructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getInterpretationSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات التفسير:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات التفسير");
      } else {
        toast.success("تم حفظ إعدادات التفسير بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handleInterpretationSettingsSubmit };
};

// PricingSettings form handler
export const usePricingSettingsHandler = () => {
  const getPricingSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('pricing_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handlePricingSettingsSubmit = async (data: {
    freePlan: {
      price: number;
      interpretationsPerMonth: number;
      features: string;
    };
    premiumPlan: {
      price: number;
      interpretationsPerMonth: number;
      features: string;
    };
    proPlan: {
      price: number;
      interpretationsPerMonth: number;
      features: string;
    };
  }) => {
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .update({
          free_plan_price: data.freePlan.price,
          free_plan_interpretations: data.freePlan.interpretationsPerMonth,
          free_plan_features: data.freePlan.features,
          premium_plan_price: data.premiumPlan.price,
          premium_plan_interpretations: data.premiumPlan.interpretationsPerMonth,
          premium_plan_features: data.premiumPlan.features,
          pro_plan_price: data.proPlan.price,
          pro_plan_interpretations: data.proPlan.interpretationsPerMonth,
          pro_plan_features: data.proPlan.features,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getPricingSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات الخطط والأسعار:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات الخطط والأسعار");
      } else {
        toast.success("تم حفظ إعدادات الخطط والأسعار بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handlePricingSettingsSubmit };
};

// PaymentSettings form handler
export const usePaymentSettingsHandler = () => {
  const getPaymentSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handlePaymentSettingsSubmit = async (data: {
    paylink: {
      enabled: boolean;
      apiKey: string;
      secretKey: string;
    };
    paypal: {
      enabled: boolean;
      clientId: string;
      secret: string;
      sandbox: boolean;
    };
  }) => {
    try {
      const { error } = await supabase
        .from('payment_settings')
        .update({
          paylink_enabled: data.paylink.enabled,
          paylink_api_key: data.paylink.apiKey,
          paylink_secret_key: data.paylink.secretKey,
          paypal_enabled: data.paypal.enabled,
          paypal_client_id: data.paypal.clientId,
          paypal_secret: data.paypal.secret,
          paypal_sandbox: data.paypal.sandbox,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getPaymentSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات بوابات الدفع:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات بوابات الدفع");
      } else {
        toast.success("تم حفظ إعدادات بوابات الدفع بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handlePaymentSettingsSubmit };
};

// ThemeSettings form handler
export const useThemeSettingsHandler = () => {
  const getThemeSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('theme_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handleThemeSettingsSubmit = async (data: {
    primaryColor: string;
    buttonColor: string;
    textColor: string;
    backgroundColor: string;
    logoText: string;
    logoFontSize: number;
    headerColor: string;
    footerColor: string;
    footerText: string;
    socialLinks: {
      twitter: string;
      facebook: string;
      instagram: string;
    };
  }) => {
    try {
      const { error } = await supabase
        .from('theme_settings')
        .update({
          primary_color: data.primaryColor,
          button_color: data.buttonColor,
          text_color: data.textColor,
          background_color: data.backgroundColor,
          logo_text: data.logoText,
          logo_font_size: data.logoFontSize,
          header_color: data.headerColor,
          footer_color: data.footerColor,
          footer_text: data.footerText,
          twitter_link: data.socialLinks.twitter,
          facebook_link: data.socialLinks.facebook,
          instagram_link: data.socialLinks.instagram,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getThemeSettingsId());
      
      if (error) {
        console.error("خطأ في حفظ إعدادات المظهر:", error);
        toast.error("حدث خطأ أثناء حفظ إعدادات المظهر");
      } else {
        toast.success("تم حفظ إعدادات المظهر بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  return { handleThemeSettingsSubmit };
};

// Logout handler
export const useLogoutHandler = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    toast.success("تم تسجيل الخروج بنجاح");
    navigate('/login');
  };

  return { handleLogout };
};
