
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';
import { supabase } from '@/integrations/supabase/client';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';

/**
 * Get subscription name in Arabic based on subscription type
 * If pricing settings are provided, use the custom names from there
 */
export const getSubscriptionName = async (subscriptionType: string | null, pricingSettings?: any): Promise<string> => {
  if (!subscriptionType) return 'الباقة المجانية';
  
  // تطبيع نوع الاشتراك للمقارنة
  const normalizedType = normalizePlanType(subscriptionType);
  
  // If pricing settings are provided, use them
  if (pricingSettings) {
    if (normalizedType === 'premium') {
      return pricingSettings.premium_plan_name || 'الباقة المميزة';
    } else if (normalizedType === 'pro') {
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
      if (normalizedType === 'premium') {
        return settings.premium_plan_name || 'الباقة المميزة';
      } else if (normalizedType === 'pro') {
        return settings.pro_plan_name || 'الباقة الاحترافية';
      } else {
        return settings.free_plan_name || 'الباقة المجانية';
      }
    }
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
  }
  
  // Default fallback values
  if (normalizedType === 'premium') {
    return 'الباقة المميزة';
  } else if (normalizedType === 'pro') {
    return 'الباقة الاحترافية';
  } else {
    return 'الباقة المجانية';
  }
};

/**
 * Calculate total interpretations based on subscription type
 * Now fetches pricing settings as part of the function instead of expecting it as an argument
 */
export const getTotalInterpretations = async (userData: User | null): Promise<number> => {
  try {
    // Fetch pricing settings
    const { data: pricingSettings, error } = await supabase
      .from('pricing_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    if (!userData?.subscription_type) {
      return pricingSettings.free_plan_interpretations;
    }
    
    const normalizedType = normalizePlanType(userData.subscription_type);
    
    if (normalizedType === 'premium') {
      return pricingSettings.premium_plan_interpretations;
    } else if (normalizedType === 'pro') {
      return pricingSettings.pro_plan_interpretations;
    } else {
      return pricingSettings.free_plan_interpretations;
    }
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    return 3; // Default fallback for free plan
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
  
  const normalizedType = normalizePlanType(userData.subscription_type);
  
  if (normalizedType === 'premium') {
    return formatPlanFeatures(pricingSettings.premium_plan_features);
  } else if (normalizedType === 'pro') {
    return formatPlanFeatures(pricingSettings.pro_plan_features);
  } else {
    return formatPlanFeatures(pricingSettings.free_plan_features);
  }
};
