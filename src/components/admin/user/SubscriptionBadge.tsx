
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';

type SubscriptionStatus = {
  name: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  isActive: boolean; // إضافة خاصية لتحديد ما إذا كان الاشتراك نشطًا
};

type SubscriptionBadgeProps = {
  user: User;
};

export const getSubscriptionStatus = (user: User): SubscriptionStatus => {
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline',
      isActive: false
    };
  }
  
  // التحقق من انتهاء صلاحية الاشتراك
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    if (expiryDate > now) {
      return { 
        name: user.subscription_type === 'premium' ? 'مميز' : 'احترافي',
        color: user.subscription_type === 'premium' ? 'secondary' : 'default',
        isActive: true // اشتراك مدفوع ولم ينتهِ بعد
      };
    } else {
      return { 
        name: 'منتهي', 
        color: 'destructive',
        isActive: false
      };
    }
  }
  
  // إذا كان هناك نوع اشتراك ولكن بدون تاريخ انتهاء، نعتبره نشطًا
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
