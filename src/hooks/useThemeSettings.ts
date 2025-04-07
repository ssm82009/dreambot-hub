
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeSettingsFormValues } from '@/contexts/admin/types';
import { initialThemeSettings } from '@/contexts/admin/initialState';

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettingsFormValues>(initialThemeSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استخدام localStorage للتخزين المؤقت للإعدادات
    const cachedSettings = localStorage.getItem('themeSettings');
    if (cachedSettings) {
      try {
        const parsedSettings = JSON.parse(cachedSettings);
        setThemeSettings(parsedSettings);
        // نضع قيمة التحميل كـ false لإظهار النافبار مباشرة مع القيم المخزنة مؤقتاً
        setLoading(false);
      } catch (error) {
        console.error("خطأ في تحليل إعدادات المظهر المخزنة:", error);
      }
    }

    const fetchThemeSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('theme_settings')
          .select(`
            primary_color, button_color, text_color, background_color, 
            logo_text, logo_font_size, header_color, footer_color, footer_text, 
            twitter_link, facebook_link, instagram_link, slug, navbar_border_color
          `)
          .limit(1)
          .single();
        
        if (error) {
          console.error("خطأ في جلب إعدادات المظهر:", error);
        } else if (data) {
          const settings = {
            primaryColor: data.primary_color || initialThemeSettings.primaryColor,
            buttonColor: data.button_color || initialThemeSettings.buttonColor,
            textColor: data.text_color || initialThemeSettings.textColor,
            backgroundColor: data.background_color || initialThemeSettings.backgroundColor,
            logoText: data.logo_text || initialThemeSettings.logoText,
            logoFontSize: data.logo_font_size || initialThemeSettings.logoFontSize,
            headerColor: data.header_color || initialThemeSettings.headerColor,
            footerColor: data.footer_color || initialThemeSettings.footerColor,
            footerText: data.footer_text || initialThemeSettings.footerText,
            twitterLink: data.twitter_link || "",
            facebookLink: data.facebook_link || "",
            instagramLink: data.instagram_link || "",
            slug: data.slug || initialThemeSettings.slug,
            navbarBorderColor: data.navbar_border_color || initialThemeSettings.navbarBorderColor
          };
          
          setThemeSettings(settings);
          
          // تخزين الإعدادات في localStorage للاستخدام المستقبلي
          localStorage.setItem('themeSettings', JSON.stringify(settings));
        }
      } catch (error) {
        console.error("خطأ في جلب إعدادات المظهر:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeSettings();
  }, []);

  return { themeSettings, loading };
};
