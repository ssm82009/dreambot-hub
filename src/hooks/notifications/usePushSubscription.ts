
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  registerServiceWorker,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush
} from '@/utils/pushNotificationUtils';

export interface PushSubscriptionState {
  subscription: PushSubscription | null;
  subscribing: boolean;
}

/**
 * هوك لإدارة اشتراكات الإشعارات
 */
export function usePushSubscription(supported: boolean, granted: boolean) {
  const [state, setState] = useState<PushSubscriptionState>({
    subscription: null,
    subscribing: false
  });
  const subscriptionInProgress = useRef<boolean>(false);

  // التحقق من وجود اشتراك حالي
  const checkExistingSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    if (!supported || !granted) {
      return null;
    }

    try {
      console.log("التحقق من وجود اشتراك حالي...");
      
      // تسجيل خدمة العامل أولاً للتأكد من وجودها
      await registerServiceWorker();
      
      // الحصول على الاشتراك الحالي
      const subscription = await getExistingSubscription();
      
      if (subscription) {
        setState(prev => ({
          ...prev,
          subscription
        }));
        console.log("تم العثور على اشتراك موجود");
      } else {
        console.log("لم يتم العثور على اشتراك");
      }
      
      return subscription;
    } catch (error) {
      console.error("خطأ في التحقق من الاشتراك الحالي:", error);
      return null;
    }
  }, [supported, granted]);

  // التحقق من الاشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted) {
      checkExistingSubscription().catch(error => {
        console.error("خطأ أثناء التحقق التلقائي من الاشتراك:", error);
      });
    }
  }, [supported, granted, checkExistingSubscription]);

  // الاشتراك في الإشعارات
  const subscribeToNotifications = useCallback(async () => {
    if (!supported) {
      console.log("الإشعارات غير مدعومة");
      return null;
    }
    
    // منع الاشتراك المتزامن المتعدد
    if (subscriptionInProgress.current) {
      console.log("عملية الاشتراك قيد التقدم بالفعل");
      return null;
    }
    
    try {
      subscriptionInProgress.current = true;
      setState(prev => ({ ...prev, subscribing: true }));
      
      console.log("بدء عملية الاشتراك في الإشعارات...");
      
      // تسجيل خدمة العامل
      await registerServiceWorker();
      
      // التحقق من وجود اشتراك حالي
      let subscription = await getExistingSubscription();
      
      // إذا كان المتصفح مشتركًا بالفعل، ارجع الاشتراك الحالي
      if (subscription) {
        console.log("تم العثور على اشتراك موجود، لا حاجة للاشتراك مجددًا");
        setState(prev => ({
          ...prev,
          subscription,
          subscribing: false
        }));
        return subscription;
      }
      
      // إنشاء اشتراك جديد
      subscription = await subscribeToPush();
      
      if (!subscription) {
        throw new Error("فشل الاشتراك في الإشعارات");
      }
      
      // تخزين اشتراك المستخدم في قاعدة البيانات
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          console.log("تخزين الاشتراك في قاعدة البيانات...");
          
          const { error } = await supabase.functions.invoke('store-subscription', {
            body: {
              userId: session.user.id,
              endpoint: subscription.endpoint,
              auth: JSON.stringify(subscription)
            }
          });
          
          if (error) {
            console.error("خطأ في تخزين الاشتراك:", error);
            throw error;
          }
          
          console.log("تم تخزين الاشتراك بنجاح");
        } catch (error) {
          console.error('خطأ في تخزين اشتراك الإشعارات:', error);
        }
      }
      
      setState(prev => ({
        ...prev,
        subscription,
        subscribing: false
      }));
      
      return subscription;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      setState(prev => ({ ...prev, subscribing: false }));
      return null;
    } finally {
      subscriptionInProgress.current = false;
    }
  }, [supported]);
  
  // إلغاء الاشتراك في الإشعارات
  const unsubscribeFromNotifications = useCallback(async () => {
    if (!state.subscription) {
      console.log("لا يوجد اشتراك نشط للإشعارات");
      return false;
    }
    
    if (subscriptionInProgress.current) {
      console.log("عملية إلغاء الاشتراك قيد التقدم بالفعل");
      return false;
    }
    
    try {
      subscriptionInProgress.current = true;
      setState(prev => ({ ...prev, subscribing: true }));
      
      console.log("إلغاء الاشتراك من الإشعارات...");
      const result = await unsubscribeFromPush(state.subscription);
      
      if (!result) {
        throw new Error("فشل إلغاء الاشتراك");
      }
      
      // حذف الاشتراك من قاعدة البيانات
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          console.log("حذف الاشتراك من قاعدة البيانات...");
          
          const { error } = await supabase.functions.invoke('remove-subscription', {
            body: {
              userId: session.user.id,
              endpoint: state.subscription.endpoint
            }
          });
          
          if (error) {
            console.error("خطأ في حذف الاشتراك:", error);
            throw error;
          }
          
          console.log("تم حذف الاشتراك من قاعدة البيانات بنجاح");
        } catch (error) {
          console.error('خطأ في حذف اشتراك الإشعارات:', error);
        }
      }
      
      setState(prev => ({
        ...prev,
        subscription: null,
        subscribing: false
      }));
      
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      setState(prev => ({ ...prev, subscribing: false }));
      return false;
    } finally {
      subscriptionInProgress.current = false;
    }
  }, [state.subscription]);

  return {
    ...state,
    checkExistingSubscription,
    subscribeToNotifications,
    unsubscribeFromNotifications
  };
}
