
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
  // تحقق من نوع الاشتراك
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline',
      isActive: false
    };
  }
  
  // تحقق مما إذا كان للاشتراك تاريخ انتهاء
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    // إذا كان تاريخ الانتهاء في المستقبل، فالاشتراك نشط
    if (expiryDate > now) {
      return { 
        name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
        color: user.subscription_type === 'premium' ? 'secondary' : 'default',
        isActive: true
      };
    } else {
      // إذا كان تاريخ الانتهاء في الماضي، فقد انتهى الاشتراك
      return { 
        name: 'منتهي', 
        color: 'destructive',
        isActive: false
      };
    }
  }
  
  // إذا كان هناك نوع اشتراك ولكن لا يوجد تاريخ انتهاء، نعتبره نشطاً
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
