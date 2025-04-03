
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';
import { normalizePlanName } from '@/utils/payment/statusNormalizer';

type SubscriptionStatus = {
  name: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  isActive: boolean;
};

type SubscriptionBadgeProps = {
  user: User;
};

export const getSubscriptionStatus = (user: User): SubscriptionStatus => {
  console.log("Getting subscription status for user:", user);
  
  // Check subscription type
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline',
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
      // Convert premium subscription values from different languages and formats
      const normalizedType = normalizePlanName(user.subscription_type);
      
      // Map normalized plan name to display name
      let displayName = 'مميز';
      let badgeColor: 'default' | 'secondary' = 'secondary';
      
      if (normalizedType === 'الاحترافية') {
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
        color: 'destructive',
        isActive: false
      };
    }
  }
  
  // If there's a subscription type but no expiry date, consider it active
  const normalizedType = normalizePlanName(user.subscription_type);
  
  // Map normalized plan name to display name
  let displayName = 'مميز';
  let badgeColor: 'default' | 'secondary' = 'secondary';
  
  if (normalizedType === 'الاحترافية') {
    displayName = 'احترافي';
    badgeColor = 'default';
  }
  
  return { 
    name: displayName,
    color: badgeColor,
    isActive: true
  };
};

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ user }) => {
  const subscriptionStatus = getSubscriptionStatus(user);
  
  return (
    <Badge variant={subscriptionStatus.color}>
      {subscriptionStatus.name}
    </Badge>
  );
};

export default SubscriptionBadge;
