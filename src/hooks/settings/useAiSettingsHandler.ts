
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from '@/contexts/admin';

// AiSettings form handler
export const useAiSettingsHandler = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setAiSettingsForm } = useAdmin();

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
      setIsUpdating(true);
      
      // Update local state immediately for UI feedback
      setAiSettingsForm(data);
      
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
    } finally {
      setIsUpdating(false);
    }
  };

  return { handleAiSettingsSubmit, isUpdating };
};
