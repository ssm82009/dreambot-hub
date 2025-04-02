
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from '@/contexts/AdminContext';

export const useAdminData = () => {
  const navigate = useNavigate();
  const {
    setIsAdmin,
    setAdminEmail,
    setIsLoading,
    setDreams,
    setUserCount,
    setSubscriptions,
    setUsers,
    setPages,
    setDbLoading,
    setAiSettingsForm,
    setInterpretationSettingsForm,
    setPricingSettingsForm,
    setPaymentSettingsForm,
    setThemeSettingsForm
  } = useAdmin();

  // Initialize admin data
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);

    // If user is admin, fetch data from database
    if (adminStatus) {
      fetchDashboardStats();
      fetchAllSettings();
    } else {
      setIsLoading(false);
      toast.error("يجب تسجيل الدخول كمشرف للوصول إلى لوحة التحكم");
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      // Fetch dream count
      const { count: dreamsCount, error: dreamsError } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (dreamsError) {
        console.error("خطأ في جلب عدد الأحلام:", dreamsError);
      } else {
        setDreams(dreamsCount || 0);
      }

      // Fetch user count
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("خطأ في جلب عدد المستخدمين:", usersError);
      } else {
        setUserCount(usersCount || 0);
      }

      // Fetch active subscriptions count
      const { count: subscriptionsCount, error: subscriptionsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_type', 'free')
        .gt('subscription_expires_at', new Date().toISOString());
      
      if (subscriptionsError) {
        console.error("خطأ في جلب عدد الاشتراكات:", subscriptionsError);
      } else {
        setSubscriptions(subscriptionsCount || 0);
      }

      // Fetch users
      const { data: usersData, error: fetchUsersError } = await supabase
        .from('users')
        .select('*');

      if (fetchUsersError) {
        console.error("خطأ في جلب المستخدمين:", fetchUsersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch pages
      const { data: pagesData, error: fetchPagesError } = await supabase
        .from('custom_pages')
        .select('*');

      if (fetchPagesError) {
        console.error("خطأ في جلب الصفحات:", fetchPagesError);
      } else {
        setPages(pagesData || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  // Fetch all settings
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
    } catch (error) {
      console.error("خطأ في جلب الإعدادات:", error);
    } finally {
      setDbLoading(false);
      setIsLoading(false);
    }
  };

  return {
    fetchDashboardStats,
    fetchAllSettings
  };
};
