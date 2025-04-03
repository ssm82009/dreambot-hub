import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get subscription name in Arabic based on subscription type
 * If pricing settings are provided, use the custom names from there
 */
export const getSubscriptionName = async (subscriptionType: string | null, pricingSettings?: any): Promise<string> => {
  if (!subscriptionType) return 'الباقة المجانية';
  
  const type = subscriptionType.toLowerCase();
  
  // If pricing settings are provided, use them
  if (pricingSettings) {
    if (type === 'premium' || type === 'المميز' || type === 'مميز') {
      return pricingSettings.premium_plan_name || 'الباقة المميزة';
    } else if (type === 'pro' || type === 'الاحترافي' || type === 'احترافي') {
      return pricingSettings.pro_plan_name || 'الباقة الاحترافية';
    } else {
      return pricingSettings.free_plan_name || 'الباقة المجانية';
    }
  }

  // Fallback to fetch pricing settings from the database
  try {
    const { data: settings, error } = await supabase
      .from('pricing_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    if (settings) {
      if (type === 'premium' || type === 'المميز' || type === 'مميز') {
        return settings.premium_plan_name || 'الباقة المميزة';
      } else if (type === 'pro' || type === 'الاحترافي' || type === 'احترافي') {
        return settings.pro_plan_name || 'الباقة الاحترافية';
      } else {
        return settings.free_plan_name || 'الباقة المجانية';
      }
    }
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
  }
  
  // Default fallback names if everything else fails
  switch (type) {
    case 'premium':
    case 'المميز':
    case 'مميز':
      return 'الباقة المميزة';
    case 'pro':
    case 'الاحترافي':
    case 'احترافي':
      return 'الباقة الاحترافية';
    default:
      return 'الباقة المجانية';
  }
};

/**
 * Calculate total interpretations based on subscription type
 */
export const getTotalInterpretations = (
  userData: User | null, 
  pricingSettings: any
): number => {
  if (!pricingSettings) return 0;
  
  if (!userData?.subscription_type) return pricingSettings.free_plan_interpretations;
  
  const subscriptionType = userData.subscription_type.toLowerCase();
  
  if (subscriptionType === 'premium' || subscriptionType === 'المميز' || subscriptionType === 'مميز') {
    return pricingSettings.premium_plan_interpretations;
  } else if (subscriptionType === 'pro' || subscriptionType === 'الاحترافي' || subscriptionType === 'احترافي') {
    return pricingSettings.pro_plan_interpretations;
  } else {
    return pricingSettings.free_plan_interpretations;
  }
};

/**
 * Format plan features from newline-separated text to array
 */
export const formatPlanFeatures = (featuresText: string): string[] => {
  return featuresText.split('\n').filter(line => line.trim() !== '');
};

/**
 * Get features for the current subscription plan
 */
export const getCurrentPlanFeatures = (
  userData: User | null, 
  pricingSettings: any
): string[] => {
  if (!pricingSettings) return [];
  
  if (!userData?.subscription_type) return formatPlanFeatures(pricingSettings.free_plan_features);
  
  const subscriptionType = userData.subscription_type.toLowerCase();
  
  if (subscriptionType === 'premium' || subscriptionType === 'المميز' || subscriptionType === 'مميز') {
    return formatPlanFeatures(pricingSettings.premium_plan_features);
  } else if (subscriptionType === 'pro' || subscriptionType === 'الاحترافي' || subscriptionType === 'احترافي') {
    return formatPlanFeatures(pricingSettings.pro_plan_features);
  } else {
    return formatPlanFeatures(pricingSettings.free_plan_features);
  }
};
