
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
