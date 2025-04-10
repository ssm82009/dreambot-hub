
import { useEffect, useState, useCallback } from 'react';
import { useNotificationPermission } from './notifications/useNotificationPermission';
import { usePushSubscription } from './notifications/usePushSubscription';
import { setupFirebase, onFCMMessage } from '@/services/firebase/firebaseClient';
import { registerFCMToken } from '@/services/firebase/fcmTokenService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * هوك إدارة الإشعارات الرئيسي
 * يجمع بين التحقق من الأذونات وإدارة الاشتراكات
 */
export function useNotifications() {
  const { supported, granted, requestPermission } = useNotificationPermission();
  const { 
    subscription, 
    subscribing,
    checkExistingSubscription,
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushSubscription(supported, granted);
  
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    checkAuth();
    
    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // تهيئة Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const isReady = await setupFirebase();
        setFirebaseReady(isReady);
        
        if (isReady) {
          console.log('تم تهيئة Firebase بنجاح وجاهز للاستخدام');
          
          // الاستماع للرسائل في الواجهة الأمامية
          const unsubscribe = await onFCMMessage((payload) => {
            console.log('تم استلام رسالة في الواجهة الأمامية:', payload);
            
            // عرض إشعار إذا كانت التطبيق في المقدمة
            if (payload.notification) {
              toast.info(payload.notification.title, {
                description: payload.notification.body,
                duration: 6000,
              });
            }
          });
          
          return unsubscribe;
        }
      } catch (error) {
        console.error('خطأ في تهيئة Firebase:', error);
      }
      return undefined;
    };
    
    const unsubscribePromise = initFirebase();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);
  
  // التحقق من وجود اشتراك عند تحميل المكون
  useEffect(() => {
    if (supported && granted) {
      const checkSubscription = async () => {
        const existingSubscription = await checkExistingSubscription();
        console.log("التحقق من الاشتراك:", existingSubscription ? "موجود" : "غير موجود");
      };
      
      checkSubscription();
    }
  }, [supported, granted, checkExistingSubscription]);
  
  // تسجيل FCM توكن عندما يكون المستخدم مسجل الدخول وتمت تهيئة Firebase
  useEffect(() => {
    if (firebaseReady && userId && granted) {
      const registerToken = async () => {
        try {
          const result = await registerFCMToken(userId);
          if (result) {
            console.log('تم تسجيل توكن FCM للمستخدم بنجاح');
          } else {
            console.warn('فشل في تسجيل توكن FCM للمستخدم');
          }
        } catch (error) {
          console.error('خطأ في تسجيل توكن FCM:', error);
        }
      };
      
      registerToken();
    }
  }, [firebaseReady, userId, granted]);
  
  // تمديد واجهة الاشتراك في الإشعارات
  const subscribeWithFirebase = useCallback(async () => {
    try {
      // الاشتراك في Web Push
      const webPushSubscription = await subscribeToNotifications();
      
      // الاشتراك في FCM إذا كان المستخدم مسجل الدخول
      if (userId && firebaseReady) {
        await registerFCMToken(userId);
      }
      
      return webPushSubscription;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      return null;
    }
  }, [subscribeToNotifications, userId, firebaseReady]);
  
  return {
    supported,
    granted,
    subscription,
    subscribing,
    firebaseReady,
    requestPermission,
    subscribeToNotifications: subscribeWithFirebase,
    unsubscribeFromNotifications
  };
}
