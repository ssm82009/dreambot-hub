
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
    
    console.log("Subscription expiry date:", expiryDate, "Current date:", now);
    
    // إذا كان تاريخ الانتهاء في المستقبل، فالاشتراك نشط
    if (expiryDate > now) {
      // تحويل قيم الاشتراك المميز من مختلف اللغات والتنسيقات
      const normalizedType = normalizePlanName(user.subscription_type);
      
      return { 
        name: normalizedType === 'المميزة' ? 'مميز' : 'احترافي',
        color: normalizedType === 'المميزة' ? 'secondary' : 'default',
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
  const normalizedType = normalizePlanName(user.subscription_type);
  
  return { 
    name: normalizedType === 'المميزة' ? 'مميز' : 'احترافي',
    color: normalizedType === 'المميزة' ? 'secondary' : 'default',
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
