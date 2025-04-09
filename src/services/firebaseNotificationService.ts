import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// مفتاح FCM السيرفر (يجب تخزينه في قاعدة البيانات)
let FCM_SERVER_KEY = '';

// واجهة بيانات الإشعار
export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// تعيين مفتاح FCM يدويًا (يمكن استخدامها للاختبار أو في حالة عدم وجود المفتاح في قاعدة البيانات)
export function setFirebaseKey(key: string) {
  if (key && key.trim() !== '') {
    FCM_SERVER_KEY = key;
    return true;
  }
  return false;
}

// تهيئة مفتاح FCM من قاعدة البيانات
export async function initializeFirebaseKey() {
  try {
    // إذا كان المفتاح موجودا بالفعل، لا داعي للاستعلام عن قاعدة البيانات
    if (FCM_SERVER_KEY) return true;
    
    // محاولة جلب المفتاح من قاعدة البيانات
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('key', 'fcm_server_key')
      .single();

    if (error) {
      console.warn('خطأ في جلب مفتاح FCM:', error.message);
      return false;
    }
    
    if (data && data.value) {
      FCM_SERVER_KEY = data.value;
      return true;
    } else {
      console.error('مفتاح FCM غير موجود في قاعدة البيانات');
      return false;
    }
  } catch (error) {
    console.error('خطأ في تهيئة مفتاح Firebase:', error);
    return false;
  }
}

// التحقق من وجود المفتاح وجلبه إذا كان غير موجود
async function ensureFirebaseKey() {
  if (!FCM_SERVER_KEY) {
    const initialized = await initializeFirebaseKey();
    if (!initialized) {
      throw new Error('مفتاح FCM غير متوفر');
    }
  }
  return true;
}

// إرسال إشعار إلى مشترك واحد
async function sendNotificationToSubscription(subscription: PushSubscription, payload: NotificationPayload) {
  try {
    await ensureFirebaseKey();

    // إعداد بيانات الإشعار
    const notification = {
      title: payload.title,
      body: payload.body,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: {
        url: payload.url || '/',
        type: payload.type || 'general'
      }
    };

    // إرسال الإشعار باستخدام واجهة برمجة تطبيقات FCM
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`
      },
      body: JSON.stringify({
        to: subscription.endpoint,
        notification,
        webpush: {
          fcm_options: {
            link: payload.url || '/'
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`فشل إرسال الإشعار: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error('خطأ في إرسال الإشعار:', error);

    // التعامل مع الاشتراكات غير الصالحة
    if (error.message?.includes('NotRegistered') || error.message?.includes('InvalidRegistration')) {
      // حذف الاشتراك غير الصالح من قاعدة البيانات
      await removeInvalidSubscription(subscription.endpoint);
    }
    
    throw error;
  }
}

// إرسال إشعار لمستخدم محدد
export async function sendNotificationToUser(userId: string, payload: NotificationPayload) {
  try {
    // الحصول على اشتراكات المستخدم
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`لا توجد اشتراكات للمستخدم ${userId}`);
      return { success: true, message: 'لا توجد اشتراكات للمستخدم', sentCount: 0 };
    }
    
    // إرسال الإشعار لكل اشتراك
    const results = await Promise.all(subscriptions.map(async (sub) => {
      try {
        // تحليل بيانات الاشتراك من حقل auth
        const parsedSubscription = JSON.parse(sub.auth);
        
        if (!parsedSubscription.endpoint) {
          console.error(`بنية اشتراك غير صحيحة للمشترك ${sub.id}`);
          return false;
        }
        
        // إرسال الإشعار
        const success = await sendNotificationToSubscription(parsedSubscription, payload);
        
        if (success) {
          // تسجيل الإشعار في قاعدة البيانات
          await supabase
            .from('notification_logs')
            .insert({
              user_id: userId,
              title: payload.title,
              body: payload.body,
              url: payload.url,
              type: payload.type,
              sent_at: new Date().toISOString()
            });
        }
        
        return success;
      } catch (error) {
        console.error(`خطأ في إرسال الإشعار للمشترك ${sub.id}:`, error);
        return false;
      }
    }));
    
    const successCount = results.filter(Boolean).length;
    
    return {
      success: true,
      message: `تم إرسال ${successCount} من ${subscriptions.length} إشعارات بنجاح`,
      sentCount: successCount
    };
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمستخدم:', error);
    throw error;
  }
}

// إرسال إشعار للمشرفين فقط
export async function sendNotificationToAdmin(payload: NotificationPayload) {
  try {
    // الحصول على قائمة المشرفين
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');
    
    if (error) throw error;
    
    if (!admins || admins.length === 0) {
      return { success: true, message: 'لا يوجد مشرفين', sentCount: 0 };
    }
    
    // إرسال إشعار لكل مشرف
    const results = await Promise.all(admins.map(admin => 
      sendNotificationToUser(admin.id, payload)
    ));
    
    // حساب إجمالي الإشعارات المرسلة
    const totalSent = results.reduce((total, result) => total + (result.sentCount || 0), 0);
    
    return {
      success: true,
      message: `تم إرسال إجمالي ${totalSent} إشعارات للمشرفين`,
      sentCount: totalSent
    };
  } catch (error) {
    console.error('خطأ في إرسال الإشعار للمشرفين:', error);
    throw error;
  }
}

// إرسال إشعار لجميع المستخدمين
export async function sendNotificationToAllUsers(payload: NotificationPayload) {
  try {
    // الحصول على جميع الاشتراكات
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');
    
    if (error) throw error;
    
    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, message: 'لا توجد اشتراكات', sentCount: 0 };
    }
    
    const userSubscriptions = new Map();
    
    // تجميع الاشتراكات حسب المستخدم
    subscriptions.forEach(sub => {
      const subs = userSubscriptions.get(sub.user_id) || [];
      subs.push(sub);
      userSubscriptions.set(sub.user_id, subs);
    });
    
    // إرسال الإشعار لكل مستخدم
    let totalSent = 0;
    
    for (const [userId, userSubs] of userSubscriptions.entries()) {
      const results = await Promise.all(userSubs.map(async (sub) => {
        try {
          // تحليل بيانات الاشتراك من حقل auth
          const parsedSubscription = JSON.parse(sub.auth);
          
          if (!parsedSubscription.endpoint) {
            console.error(`بنية اشتراك غير صحيحة للمشترك ${sub.id}`);
            return false;
          }
          
          // إرسال الإشعار
          const success = await sendNotificationToSubscription(parsedSubscription, payload);
          
          if (success) {
            // تسجيل الإشعار في قاعدة البيانات
            await supabase
              .from('notification_logs')
              .insert({
                user_id: userId,
                title: payload.title,
                body: payload.body,
                url: payload.url,
                type: payload.type,
                sent_at: new Date().toISOString()
              });
          }
          
          return success;
        } catch (error) {
          console.error(`خطأ في إرسال الإشعار للمشترك ${sub.id}:`, error);
          return false;
        }
      }));
      
      totalSent += results.filter(Boolean).length;
    }
    
    return {
      success: true,
      message: `تم إرسال ${totalSent} إشعارات بنجاح`,
      sentCount: totalSent
    };
  } catch (error) {
    console.error('خطأ في إرسال الإشعار لجميع المستخدمين:', error);
    throw error;
  }
}

// حذف اشتراك غير صالح من قاعدة البيانات
async function removeInvalidSubscription(endpoint: string) {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);
    
    if (error) {
      console.error('خطأ في حذف الاشتراك غير الصالح:', error);
      return false;
    }
    
    console.log('تم حذف الاشتراك غير الصالح بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ غير متوقع في حذف الاشتراك غير الصالح:', error);
    return false;
  }
}
