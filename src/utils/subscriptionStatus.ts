
import { User } from '@/types/database';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';

export const getSubscriptionStatus = (user: User) => {
  console.log("Getting subscription status for user:", user);
  
  // التحقق من نوع الاشتراك
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline' as const,
      isActive: true // الباقة المجانية دائماً نشطة
    };
  }
  
  // التحقق من تاريخ انتهاء الاشتراك
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    console.log("Subscription expiry date:", expiryDate, "Current date:", now);
    
    // إذا كان التاريخ infinity أو في المستقبل، الاشتراك نشط
    if (user.subscription_expires_at === 'infinity' || expiryDate > now) {
      // تطبيع نوع الاشتراك
      const normalizedType = normalizePlanType(user.subscription_type);
      
      // تعيين لون الشارة واسم العرض البسيط
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
      // إذا كان تاريخ الانتهاء في الماضي، الاشتراك منتهي
      return { 
        name: 'منتهي', 
        color: 'destructive' as const,
        isActive: false
      };
    }
  }
  
  // إذا كان هناك نوع اشتراك ولكن بدون تاريخ انتهاء، اعتبره نشطاً
  const normalizedType = normalizePlanType(user.subscription_type);
  
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
