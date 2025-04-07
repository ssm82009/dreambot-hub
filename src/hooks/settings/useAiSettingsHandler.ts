
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from '@/contexts/admin';

// AiSettings form handler
export const useAiSettingsHandler = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setAiSettingsForm } = useAdmin();

  const getAiSettingsId = async (): Promise<string> => {
    try {
      // Check if there's already a record
      const { data, error } = await supabase
        .from('ai_settings')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching AI settings ID:', error);
        throw error;
      }
      
      // If no record exists, create one with default values
      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from('ai_settings')
          .insert({
            provider: 'together',
            api_key: '',
            model: 'meta-llama/Llama-3-8b-chat-hf'
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error('Error creating default AI settings:', insertError);
          throw insertError;
        }
        
        return newSettings.id;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error in getAiSettingsId:', error);
      toast.error('خطأ في استرجاع إعدادات الذكاء الاصطناعي');
      return '';
    }
  };

  const handleAiSettingsSubmit = async (data: {
    provider: string;
    apiKey: string;
    model: string;
  }) => {
    try {
      setIsUpdating(true);
      
      // Update local state immediately for UI feedback
      setAiSettingsForm(data);
      
      // Get or create settings ID
      const settingsId = await getAiSettingsId();
      if (!settingsId) {
        throw new Error('فشل في الحصول على معرف إعدادات الذكاء الاصطناعي');
      }
      
      const { error } = await supabase
        .from('ai_settings')
        .update({
          provider: data.provider,
          api_key: data.apiKey,
          model: data.model,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingsId);
      
      if (error) {
        console.error("خطأ في حفظ إعدادات الذكاء الاصطناعي:", error);
        toast.error("حدث خطأ أثناء حفظ الإعدادات");
      } else {
        toast.success("تم حفظ إعدادات الذكاء الاصطناعي بنجاح");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsUpdating(false);
    }
  };

  return { handleAiSettingsSubmit, isUpdating };
};
