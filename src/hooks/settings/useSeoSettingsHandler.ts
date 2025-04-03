
import { useState } from 'react';
import { useAdmin } from '@/contexts/admin';
import { SeoSettingsFormValues } from '@/contexts/admin/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSeoSettingsHandler = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { setSeoSettingsForm } = useAdmin();

  const getThemeSettingsId = async (): Promise<string> => {
    const { data } = await supabase
      .from('theme_settings')
      .select('id')
      .limit(1)
      .single();
    return data?.id || '';
  };

  const updateSeoSettings = async (data: SeoSettingsFormValues) => {
    setIsUpdating(true);
    setIsSuccess(false);
    
    try {
      // Update local state first for immediate UI feedback
      setSeoSettingsForm(data);
      
      // Check if theme_settings table exists
      const { data: tableExists } = await supabase
        .from('theme_settings')
        .select('id')
        .limit(1);
      
      let result;
      
      if (tableExists && tableExists.length > 0) {
        // Update existing record
        result = await supabase
          .from('theme_settings')
          .update({
            meta_title: data.metaTitle,
            meta_description: data.metaDescription,
            keywords: data.keywords,
            enable_sitemap: data.enableSitemap,
            enable_robots_txt: data.enableRobotsTxt,
            enable_canonical_urls: data.enableCanonicalUrls,
            enable_open_graph: data.enableOpenGraph,
            enable_twitter_cards: data.enableTwitterCards,
            google_analytics_id: data.googleAnalyticsId,
            custom_head_tags: data.customHeadTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', await getThemeSettingsId());
      } else {
        // Create new record if doesn't exist
        result = await supabase
          .from('theme_settings')
          .insert({
            meta_title: data.metaTitle,
            meta_description: data.metaDescription,
            keywords: data.keywords,
            enable_sitemap: data.enableSitemap,
            enable_robots_txt: data.enableRobotsTxt,
            enable_canonical_urls: data.enableCanonicalUrls,
            enable_open_graph: data.enableOpenGraph,
            enable_twitter_cards: data.enableTwitterCards,
            google_analytics_id: data.googleAnalyticsId,
            custom_head_tags: data.customHeadTags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error('Error updating SEO settings:', result.error);
        toast.error("حدث خطأ أثناء تحديث إعدادات السيو");
        throw result.error;
      }
      
      setIsSuccess(true);
      toast.success("تم حفظ إعدادات السيو بنجاح");
      
      return { success: true };
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateSeoSettings,
    isUpdating,
    isSuccess
  };
};
