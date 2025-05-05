
import { normalizePlanType } from '@/utils/payment/statusNormalizer';
import { User } from '@/types/database';

/**
 * Get a display name for a subscription type
 * @param subscriptionType The subscription type from the database
 * @param pricingSettings The pricing settings from the database
 * @returns The display name for the subscription
 */
export const getSubscriptionName = async (
  subscriptionType: string | null | undefined,
  pricingSettings: any = null
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

/**
 * Get the total number of interpretations allowed for a user based on their subscription type
 * @param userData The user data from the database
 * @param pricingSettings The pricing settings from the database (optional)
 * @returns The total number of interpretations allowed (-1 for unlimited)
 */
export const getTotalInterpretations = async (
  userData: User | null,
  pricingSettings: any = null
): Promise<number> => {
  if (!userData) return 0;
  
  const subscriptionType = userData.subscription_type || 'free';
  
  if (!pricingSettings) {
    // Default values if pricing settings not available
    switch (subscriptionType) {
      case 'pro':
      case 'الاحترافي':
        return -1; // Unlimited
      case 'premium':
      case 'المميز':
        return -1; // Unlimited
      default:
        return 3; // Free plan default
    }
  }
  
  // Use values from pricing settings
  switch (subscriptionType) {
    case 'pro':
    case 'الاحترافي':
      return pricingSettings.pro_plan_interpretations;
    case 'premium':
    case 'المميز':
      return pricingSettings.premium_plan_interpretations;
    default:
      return pricingSettings.free_plan_interpretations;
  }
};
