
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
