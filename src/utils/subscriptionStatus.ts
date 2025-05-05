
import { User } from '@/types/database';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';

export const getSubscriptionStatus = (user: User | null) => {
  // Check if user is null or undefined
  if (!user) {
    return { 
      name: 'غير متوفر', 
      color: 'outline' as const,
      isActive: false
    };
  }
  
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
    // تعامل خاص مع القيمة "infinity"
    if (user.subscription_expires_at === 'infinity') {
      // الاشتراك غير محدود المدة ولكن ليس غير محدود التفسيرات
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
    }
    
    // التعامل مع التواريخ العادية
    try {
      const expiryDate = new Date(user.subscription_expires_at);
      const now = new Date();
      
      console.log("Subscription expiry date:", expiryDate, "Current date:", now);
      
      // إذا كان التاريخ في المستقبل، الاشتراك نشط
      if (expiryDate > now) {
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
      } else {
        // إذا كان تاريخ الانتهاء في الماضي، الاشتراك منتهي
        return { 
          name: 'منتهي', 
          color: 'destructive' as const,
          isActive: false
        };
      }
    } catch (error) {
      console.error('Error parsing subscription date:', error);
      // في حالة حدوث خطأ في تحليل التاريخ، نفترض أن الاشتراك منتهٍ
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
