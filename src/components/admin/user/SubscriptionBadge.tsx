
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';

type SubscriptionStatus = {
  name: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  isActive: boolean;
};

type SubscriptionBadgeProps = {
  user: User;
};

export const getSubscriptionStatus = (user: User): SubscriptionStatus => {
  // If no subscription or free, return free
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline',
      isActive: false
    };
  }
  
  // Check if subscription has an expiry date
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    // If expiry date is in the future, subscription is active
    if (expiryDate > now) {
      return { 
        name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
        color: user.subscription_type === 'premium' ? 'secondary' : 'default',
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
  // This handles cases where expiry date might not be set properly
  return { 
    name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
    color: user.subscription_type === 'premium' ? 'secondary' : 'default',
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
