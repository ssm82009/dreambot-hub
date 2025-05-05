
import { normalizePlanType } from '@/utils/payment/statusNormalizer';

/**
 * Get a display name for a subscription type
 * @param subscriptionType The subscription type from the database
 * @param pricingSettings The pricing settings from the database
 * @returns The display name for the subscription
 */
export const getSubscriptionName = async (
  subscriptionType: string | null | undefined,
  pricingSettings: any
) => {
  if (!subscriptionType) return 'الباقة المجانية';
  
  const normalizedType = normalizePlanType(subscriptionType);
  
  if (!pricingSettings) {
    // Fallback if pricing settings not available
    switch (normalizedType) {
      case 'premium':
        return 'الباقة المميزة';
      case 'pro':
        return 'الباقة الاحترافية';
      default:
        return 'الباقة المجانية';
    }
  }
  
  switch (normalizedType) {
    case 'premium':
      return pricingSettings.premium_plan_name || 'الباقة المميزة';
    case 'pro':
      return pricingSettings.pro_plan_name || 'الباقة الاحترافية';
    default:
      return pricingSettings.free_plan_name || 'الباقة المجانية';
  }
};
