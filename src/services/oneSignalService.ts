
/**
 * خدمة OneSignal لإدارة الإشعارات
 */

// واجهات البيانات
interface OneSignalInitOptions {
  appId: string;
  serviceWorkerPath?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

class OneSignalService {
  private static instance: OneSignalService;
  private _isReady: boolean = false;

  /**
   * الحصول على instance وحيدة من الخدمة
   */
  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  /**
   * تهيئة خدمة OneSignal
   * @param options خيارات التهيئة
   */
  async initialize(options: OneSignalInitOptions): Promise<boolean> {
    try {
      if (!window.OneSignal) {
        console.warn('لم يتم العثور على OneSignal. تأكد من تحميل المكتبة.');
        return false;
      }

      if (this._isReady) {
        console.log('OneSignal جاهز بالفعل');
        return true;
      }

      await window.OneSignal.init({
        appId: options.appId,
        serviceWorkerPath: options.serviceWorkerPath || '/OneSignalSDKWorker.js',
      });

      console.log('تم تهيئة OneSignal بنجاح');
      this._isReady = true;
      return true;
    } catch (error) {
      console.error('خطأ في تهيئة OneSignal:', error);
      return false;
    }
  }

  /**
   * التحقق من دعم الإشعارات في المتصفح
   */
  async isPushNotificationsSupported(): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      return await window.OneSignal.Notifications.isPushSupported();
    } catch (error) {
      console.error('خطأ في التحقق من دعم الإشعارات:', error);
      return false;
    }
  }

  /**
   * طلب إذن للإشعارات
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      const result = await window.OneSignal.Notifications.requestPermission();
      return result;
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      return false;
    }
  }

  /**
   * الاشتراك في الإشعارات
   */
  async subscribeToNotifications(): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      // أولاً نطلب إذن الإشعارات
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) return false;
      
      // ثم نفعّل الاشتراك
      await window.OneSignal.Notifications.setEnabled(true);
      
      return true;
    } catch (error) {
      console.error('خطأ في الاشتراك في الإشعارات:', error);
      return false;
    }
  }

  /**
   * إلغاء الاشتراك في الإشعارات
   */
  async unsubscribeFromNotifications(): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      await window.OneSignal.Notifications.setEnabled(false);
      return true;
    } catch (error) {
      console.error('خطأ في إلغاء الاشتراك من الإشعارات:', error);
      return false;
    }
  }

  /**
   * الحصول على حالة الاشتراك الحالية
   */
  async getSubscriptionStatus(): Promise<boolean> {
    try {
      if (!this._isReady || !window.OneSignal.Notifications) return false;
      
      return window.OneSignal.Notifications.permission;
    } catch (error) {
      console.error('خطأ في الحصول على حالة الاشتراك:', error);
      return false;
    }
  }

  /**
   * ربط معرف المستخدم الخارجي
   * @param externalId معرف المستخدم الخارجي
   */
  async setExternalUserId(externalId: string): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      if (window.OneSignal.User && window.OneSignal.User.login) {
        await window.OneSignal.User.login(externalId);
      } else if (window.OneSignal.login) {
        await window.OneSignal.login(externalId);
      } else if (window.OneSignal.setExternalUserId) {
        await window.OneSignal.setExternalUserId(externalId);
      } else {
        console.error('لا يوجد طريقة متاحة لربط معرف المستخدم الخارجي');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في ربط معرف المستخدم الخارجي:', error);
      return false;
    }
  }

  /**
   * إزالة معرف المستخدم الخارجي
   */
  async removeExternalUserId(): Promise<boolean> {
    try {
      if (!this._isReady) return false;
      
      if (window.OneSignal.User && window.OneSignal.User.logout) {
        await window.OneSignal.User.logout();
      } else if (window.OneSignal.logout) {
        await window.OneSignal.logout();
      } else if (window.OneSignal.removeExternalUserId) {
        await window.OneSignal.removeExternalUserId();
      } else {
        console.error('لا يوجد طريقة متاحة لإزالة معرف المستخدم الخارجي');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في إزالة معرف المستخدم الخارجي:', error);
      return false;
    }
  }

  /**
   * الخصائص العامة
   */
  get isReady(): boolean {
    return this._isReady;
  }
}

// إرسال إشعار للمشرفين
export async function sendNotificationToAdmin(payload: NotificationPayload): Promise<any> {
  try {
    console.log('محاولة إرسال إشعار للمشرفين:', payload);
    
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        adminOnly: true,
        notification: payload
      }
    });

    if (error) {
      console.error('خطأ في استدعاء وظيفة Edge Function للمشرفين:', error);
      throw error;
    }
    
    console.log('نتيجة إرسال الإشعار للمشرفين:', data);
    return data;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    throw error;
  }
}

// import supabase client here to avoid circular dependencies
import { supabase } from '@/integrations/supabase/client';

// تصدير instance واحدة من الخدمة
const OneSignalServiceInstance = OneSignalService.getInstance();
export default OneSignalServiceInstance;

// تصدير class OneSignalService للاستخدام في الخدمات الأخرى
export { OneSignalService };
