
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from '@/contexts/admin';
import { ThemeSettingsFormValues } from '@/contexts/admin/types';

// ThemeSettings form handler
export const useThemeSettingsHandler = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setThemeSettingsForm } = useAdmin();

  const getThemeSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('theme_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const handleThemeSettingsSubmit = async (data: ThemeSettingsFormValues) => {
    setIsUpdating(true);
    
    try {
      // Update local state first for immediate UI feedback
      setThemeSettingsForm(data);
      
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
          twitter_link: data.twitterLink,
          facebook_link: data.facebookLink,
          instagram_link: data.instagramLink,
          slug: data.slug,
          navbar_border_color: data.navbarBorderColor,
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
    } finally {
      setIsUpdating(false);
    }
  };

  return { handleThemeSettingsSubmit, isUpdating };
};
