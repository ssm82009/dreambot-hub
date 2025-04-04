
import { User } from '@/types/database';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';

export const getSubscriptionStatus = (user: User) => {
  console.log("Getting subscription status for user:", user);
  
  // Check subscription type
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline' as const,
      isActive: false
    };
  }
  
  // Check if subscription has expiry date
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    console.log("Subscription expiry date:", expiryDate, "Current date:", now);
    
    // If expiry date is in the future, subscription is active
    if (expiryDate > now) {
      // Normalize the subscription type
      const normalizedType = normalizePlanType(user.subscription_type);
      
      // Map normalized plan type to badge color and simple display name
      let displayName = 'مميز';
      let badgeColor: 'default' | 'secondary' = 'secondary';
      
      if (normalizedType === 'pro') {
        displayName = 'احترافي';
        badgeColor = 'default';
      }
      
      return { 
        name: displayName,
        color: badgeColor,
        isActive: true
      };
    } else {
      // If expiry date is in the past, subscription has expired
      return { 
        name: 'منتهي', 
        color: 'destructive' as const,
        isActive: false
      };
    }
  }
  
  // If there's a subscription type but no expiry date, consider it active
  const normalizedType = normalizePlanType(user.subscription_type);
  
  // Map normalized plan type to badge color and simple display name
  let displayName = 'مميز';
  let badgeColor: 'default' | 'secondary' = 'secondary';
  
  if (normalizedType === 'pro') {
    displayName = 'احترافي';
    badgeColor = 'default';
  }
  
  return { 
    name: displayName,
    color: badgeColor,
    isActive: true
  };
};
