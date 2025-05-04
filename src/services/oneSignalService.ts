
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

/**
 * تهيئة OneSignal واستخدامه لإرسال الإشعارات
 */
export class OneSignalService {
  /**
   * التحقق من أن OneSignal جاهز للاستخدام
   */
  static get isReady(): boolean {
    return typeof window !== 'undefined' && 
           window.OneSignal !== undefined;
  }

  /**
   * التحقق من أن OneSignal يستخدم الواجهة الجديدة
   */
  static get isNewAPI(): boolean {
    return this.isReady && 
           window.OneSignal?.User !== undefined &&
           window.OneSignal?.Notifications !== undefined;
  }

  /**
   * تهيئة OneSignal مع معرف المستخدم
   * @param userId معرف المستخدم
   */
  static async initialize(userId?: string): Promise<boolean> {
    try {
      // التأكد من أن OneSignal موجود وتم تحميله
      if (!window.OneSignal) {
        console.warn('OneSignal غير متاح، انتظار التحميل...');
        // انتظر التحميل المؤجل لـ OneSignal
        return new Promise((resolve) => {
          if (!window.OneSignalDeferred) {
            window.OneSignalDeferred = [];
          }
          
          window.OneSignalDeferred.push(() => {
            this.initializeWithUserId(userId)
              .then(resolve)
              .catch((error) => {
                console.error('خطأ في تهيئة OneSignal المؤجلة:', error);
                resolve(false);
              });
          });
          
          // تحديد مهلة للانتظار
          setTimeout(() => {
            console.warn('انتهت مهلة انتظار تحميل OneSignal');
            resolve(false);
          }, 5000);
        });
      }
      
      return this.initializeWithUserId(userId);
    } catch (error) {
      console.error('خطأ في تهيئة OneSignal:', error);
      return false;
    }
  }
  
  /**
   * تهيئة OneSignal مع معرف المستخدم (مساعد داخلي)
   */
  private static async initializeWithUserId(userId?: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.warn('OneSignal غير متاح أو لم يتم تحميله بعد');
        return false;
      }
      
      // تعيين هوية المستخدم في OneSignal إذا كان متاحاً
      if (userId) {
        // استخدام الواجهة الجديدة أو القديمة حسب توفرها
        if (this.isNewAPI) {
          await window.OneSignal.login(userId);
          console.log('تم تسجيل دخول المستخدم في OneSignal (واجهة جديدة):', userId);
        } else if (window.OneSignal?.setExternalUserId) {
          await window.OneSignal.setExternalUserId(userId);
          console.log('تم تعيين معرف المستخدم الخارجي (واجهة قديمة):', userId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تهيئة OneSignal مع معرف المستخدم:', error);
      return false;
    }
  }

  /**
   * تعيين معرف المستخدم الخارجي
   */
  static async setExternalUserId(userId: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        return false;
      }
      
      if (this.isNewAPI) {
        await window.OneSignal.login(userId);
      } else if (window.OneSignal?.setExternalUserId) {
        await window.OneSignal.setExternalUserId(userId);
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تعيين معرف المستخدم الخارجي:', error);
      return false;
    }
  }
  
  /**
   * إزالة معرف المستخدم الخارجي
   */
  static async removeExternalUserId(): Promise<boolean> {
    try {
      if (!this.isReady) {
        return false;
      }
      
      if (this.isNewAPI) {
        await window.OneSignal.logout();
      } else if (window.OneSignal?.removeExternalUserId) {
        await window.OneSignal.removeExternalUserId();
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في إزالة معرف المستخدم الخارجي:', error);
      return false;
    }
  }

  /**
   * طلب إذن الإشعارات من المستخدم
   */
  static async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.warn('OneSignal غير متاح أو لم يتم تحميله بعد');
        return false;
      }

      // استخدام الواجهة الجديدة أو القديمة حسب توفرها
      if (this.isNewAPI) {
        const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
        if (!isPushSupported) {
          console.warn('متصفحك لا يدعم الإشعارات');
          return false;
        }

        // التحقق من حالة الإذن الحالية
        const permission = await window.OneSignal.Notifications.permission;
        
        if (permission === true) {
          console.log('الإشعارات مسموح بها بالفعل');
          return true;
        } else if (permission === false) {
          console.warn('تم رفض الإشعارات من قبل المتصفح');
          return false;
        }

        // طلب إذن الإشعارات من المستخدم
        const result = await window.OneSignal.Notifications.requestPermission();
        console.log('نتيجة طلب إذن الإشعارات:', result);
        return result;
      } else if (window.OneSignal?.registerForPushNotifications) {
        // استخدام الواجهة القديمة
        await window.OneSignal.registerForPushNotifications();
        const result = await this.getSubscriptionStatus();
        return result;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      return false;
    }
  }

  /**
   * الاشتراك في الإشعارات
   */
  static async subscribeToNotifications(): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.warn('OneSignal غير متاح أو لم يتم تحميله بعد');
        return false;
      }

      // طلب الإذن إذا لم يكن لدينا إذن بالفعل
      const permission = await this.requestNotificationPermission();
      if (!permission) {
        return false;
      }

      // تفعيل الإشعارات باستخدام الواجهة المناسبة
      if (this.isNewAPI) {
        await window.OneSignal.Notifications.setEnabled(true);
      } else if (window.OneSignal?.setSubscription) {
        await window.OneSignal.setSubscription(true);
      }
      
      console.log('تم تفعيل الإشعارات بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      return false;
    }
  }

  /**
   * إلغاء الاشتراك في الإشعارات
   */
  static async unsubscribeFromNotifications(): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.warn('OneSignal غير متاح أو لم يتم تحميله بعد');
        return false;
      }

      // تعطيل الإشعارات باستخدام الواجهة المناسبة
      if (this.isNewAPI) {
        await window.OneSignal.Notifications.setEnabled(false);
      } else if (window.OneSignal?.setSubscription) {
        await window.OneSignal.setSubscription(false);
      }
      
      console.log('تم إلغاء تفعيل الإشعارات بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      return false;
    }
  }

  /**
   * التحقق من حالة الاشتراك في الإشعارات
   */
  static async getSubscriptionStatus(): Promise<boolean> {
    try {
      if (!this.isReady) {
        console.warn('OneSignal غير متاح أو لم يتم تحميله بعد');
        return false;
      }

      try {
        if (this.isNewAPI) {
          const isEnabled = await window.OneSignal.Notifications.permission;
          return isEnabled === true;
        } else if (window.OneSignal?.isPushNotificationsEnabled) {
          return await window.OneSignal.isPushNotificationsEnabled();
        }
        return false;
      } catch (error) {
        console.error('خطأ في جلب حالة إذن الإشعارات:', error);
        return false;
      }
    } catch (error) {
      console.error('خطأ في جلب حالة اشتراك الإشعارات:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار للمستخدمين
   */
  static async sendNotification(payload: NotificationPayload, targetUsers?: string[]): Promise<boolean> {
    try {
      // استخدام Edge Function لإرسال الإشعارات عبر OneSignal
      const { error } = await supabase.functions.invoke('send-onesignal-notification', {
        body: {
          notification: payload,
          targetUsers: targetUsers
        }
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      return false;
    }
  }
}

// إعادة تصدير الدوال المستخدمة للتوافق مع الرمز السابق
export const sendNotification = async (userId: string, payload: NotificationPayload) => {
  return await OneSignalService.sendNotification(payload, [userId]);
};

/**
 * إرسال إشعار للمسؤولين
 */
export const sendNotificationToAdmin = async (payload: NotificationPayload): Promise<boolean> => {
  // استرجاع قائمة المسؤولين من قاعدة البيانات
  try {
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (error) throw error;

    if (admins && admins.length > 0) {
      const adminIds = admins.map(admin => admin.id);
      return await OneSignalService.sendNotification(payload, adminIds);
    }
    
    return false;
  } catch (error) {
    console.error('خطأ في إرسال إشعار للمسؤولين:', error);
    return false;
  }
};

// تصدير الواجهة بشكل افتراضي للتوافق
export default OneSignalService;
