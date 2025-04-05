
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { PricingSettingsFormValues } from '@/contexts/admin/types';

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

  const handlePricingSettingsSubmit = async (data: PricingSettingsFormValues) => {
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .update({
          free_plan_name: data.freePlanName,
          free_plan_price: data.freePlanPrice,
          free_plan_interpretations: data.freePlanInterpretations,
          free_plan_features: data.freePlanFeatures,
          premium_plan_name: data.premiumPlanName,
          premium_plan_price: data.premiumPlanPrice,
          premium_plan_interpretations: data.premiumPlanInterpretations,
          premium_plan_features: data.premiumPlanFeatures,
          pro_plan_name: data.proPlanName,
          pro_plan_price: data.proPlanPrice,
          pro_plan_interpretations: data.proPlanInterpretations,
          pro_plan_features: data.proPlanFeatures,
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
