
import React, { useState, useEffect } from 'react';
import PricingPlanCard, { PricingPlan } from './PricingPlanCard';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingPlansProps {
  onSubscribe: (planId: string, price: number) => void;
}

const PricingPlans = ({ onSubscribe }: PricingPlansProps) => {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error("خطأ في جلب إعدادات الأسعار:", error);
          toast.error("حدث خطأ أثناء تحميل خطط الأسعار");
          setLoading(false);
          return;
        }

        if (data) {
          // Parse features strings into arrays of features
          const freePlanFeatures = data.free_plan_features
            .split('\n')
            .filter(Boolean)
            .map((text: string) => ({ text }));

          const premiumPlanFeatures = data.premium_plan_features
            .split('\n')
            .filter(Boolean)
            .map((text: string) => ({ text }));

          const proPlanFeatures = data.pro_plan_features
            .split('\n')
            .filter(Boolean)
            .map((text: string) => ({ text }));

          // Create plan objects
          const plans: PricingPlan[] = [
            {
              id: 'المجاني',
              name: data.free_plan_name || 'المجاني',
              price: Number(data.free_plan_price),
              description: 'للاستخدام الأساسي',
              features: freePlanFeatures
            },
            {
              id: 'المميز',
              name: data.premium_plan_name || 'المميز',
              price: Number(data.premium_plan_price),
              description: 'للمستخدمين النشطين',
              features: premiumPlanFeatures,
              isPopular: true
            },
            {
              id: 'الاحترافي',
              name: data.pro_plan_name || 'الاحترافي',
              price: Number(data.pro_plan_price),
              description: 'للمؤسسات والمحترفين',
              features: proPlanFeatures
            }
          ];

          setPricingPlans(plans);
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
        toast.error("حدث خطأ أثناء تحميل خطط الأسعار");
      } finally {
        setLoading(false);
      }
    };

    fetchPricingSettings();
  }, []);

  const handleSubscribe = (planId: string) => {
    // البحث عن الخطة المحددة للحصول على السعر
    const selectedPlan = pricingPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      onSubscribe(planId, selectedPlan.price);
    } else {
      toast.error("حدث خطأ أثناء اختيار الخطة");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {pricingPlans.map((plan) => (
        <PricingPlanCard 
          key={plan.id} 
          plan={plan} 
          onSubscribe={() => handleSubscribe(plan.id)} 
        />
      ))}
    </div>
  );
};

export default PricingPlans;
