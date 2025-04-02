
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';

type SubscriptionStatus = {
  name: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
};

type SubscriptionBadgeProps = {
  user: User;
};

export const getSubscriptionStatus = (user: User): SubscriptionStatus => {
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { name: 'مجاني', color: 'outline' };
  }
  
  // التحقق من انتهاء صلاحية الاشتراك
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    if (expiryDate > now) {
      return { 
        name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
        color: user.subscription_type === 'premium' ? 'secondary' : 'default'
      };
    } else {
      return { name: 'منتهي', color: 'destructive' };
    }
  }
  
  return { name: 'مجاني', color: 'outline' };
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
