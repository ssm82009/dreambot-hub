
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ThemeSettingsFormValues } from '@/contexts/admin/types';
import { initialThemeSettings } from '@/contexts/admin/initialState';

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettingsFormValues>(initialThemeSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemeSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('theme_settings')
          .select(`
            primary_color, button_color, text_color, background_color, 
            logo_text, logo_font_size, header_color, footer_color, footer_text, 
            twitter_link, facebook_link, instagram_link, slug
          `)
          .limit(1)
          .single();
        
        if (error) {
          console.error("خطأ في جلب إعدادات المظهر:", error);
        } else if (data) {
          setThemeSettings({
            primaryColor: data.primary_color,
            buttonColor: data.button_color,
            textColor: data.text_color,
            backgroundColor: data.background_color,
            logoText: data.logo_text,
            logoFontSize: data.logo_font_size,
            headerColor: data.header_color,
            footerColor: data.footer_color,
            footerText: data.footer_text,
            socialLinks: {
              twitter: data.twitter_link || "",
              facebook: data.facebook_link || "",
              instagram: data.instagram_link || ""
            },
            slug: data.slug || "تفسير الأحلام عبر الذكاء الاصطناعي"
          });
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
