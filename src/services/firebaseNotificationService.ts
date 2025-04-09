
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// واجهة بيانات الإشعار
export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  type?: 'general' | 'ticket' | 'payment' | 'subscription';
}

// واجهة مفتاح حساب الخدمة
export interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  project_id: string;
}

// تخزين مفتاح الحساب الخدمي بشكل مؤقت
let serviceAccountKey: ServiceAccountKey | null = null;

// تخزين معرف مشروع Firebase
let projectId: string | null = null;

// تعيين مفتاح الحساب الخدمي يدويًا
export function setServiceAccountKey(key: string) {
  try {
    if (!key || key.trim() === '') return false;
    
    // محاولة تحليل مفتاح JSON
    const parsedKey = JSON.parse(key);
    
    // التحقق من وجود الحقول الأساسية
    if (!parsedKey.client_email || !parsedKey.private_key || !parsedKey.project_id) {
      console.error('مفتاح الحساب الخدمي غير صالح، يجب أن يحتوي على client_email و private_key و project_id');
      return false;
    }
    
    serviceAccountKey = parsedKey;
    projectId = parsedKey.project_id;
    
    console.log('تم تعيين مفتاح الحساب الخدمي بنجاح');
    return true;
  } catch (error) {
    console.error('خطأ في تعيين مفتاح الحساب الخدمي:', error);
    return false;
  }
}

// تهيئة مفتاح الحساب الخدمي من قاعدة البيانات
export async function initializeServiceAccountKey() {
  try {
    // إذا كان المفتاح موجودا بالفعل، لا داعي للاستعلام عن قاعدة البيانات
    if (serviceAccountKey) return true;
    
    // محاولة جلب المفتاح من قاعدة البيانات
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('key', 'firebase_service_account_key')
      .single();

    if (error) {
      console.warn('خطأ في جلب مفتاح الحساب الخدمي:', error.message);
      return false;
    }
    
    if (data?.value) {
      try {
        const parsedKey = JSON.parse(data.value);
        
        if (!parsedKey.client_email || !parsedKey.private_key || !parsedKey.project_id) {
          console.error('مفتاح الحساب الخدمي في قاعدة البيانات غير صالح');
          return false;
        }
        
        serviceAccountKey = parsedKey;
        projectId = parsedKey.project_id;
        
        console.log('تم تهيئة مفتاح الحساب الخدمي من قاعدة البيانات');
        return true;
      } catch (error) {
        console.error('خطأ في تحليل مفتاح الحساب الخدمي من قاعدة البيانات:', error);
        return false;
      }
    } else {
      console.error('مفتاح الحساب الخدمي غير موجود في قاعدة البيانات');
      return false;
    }
  } catch (error) {
    console.error('خطأ في تهيئة مفتاح الحساب الخدمي:', error);
    return false;
  }
}

// استدعاء وظيفة تهيئة مفتاح Firebase مباشرة
initializeServiceAccountKey().catch(err => console.error('فشل تهيئة مفتاح الحساب الخدمي:', err));

// التحقق من وجود المفتاح وجلبه إذا كان غير موجود
async function ensureServiceAccountKey() {
  if (!serviceAccountKey) {
    const initialized = await initializeServiceAccountKey();
    if (!initialized) {
      throw new Error('مفتاح الحساب الخدمي غير متوفر');
    }
  }
  return true;
}

// الحصول على رمز وصول (access token) من Firebase
async function getFirebaseAccessToken() {
  try {
    await ensureServiceAccountKey();
    
    if (!serviceAccountKey) {
      throw new Error('مفتاح الحساب الخدمي غير متوفر');
    }
    
    // إنشاء JWT assertion للحصول على رمز الوصول
    const now = Math.floor(Date.now() / 1000);
    const expTime = now + 3600; // صلاحية لمدة ساعة
    
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };
    
    const payload = {
      iss: serviceAccountKey.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      exp: expTime,
      iat: now
    };
    
    // توقيع JWT باستخدام المفتاح الخاص - نحتاج لمكتبة لتوقيع JWT
    // هذا سيتطلب مكتبة مثل jsonwebtoken أو يمكننا استخدام خدمة سوبابيس للتوقيع
    
    // استخدام وظيفة سوبابيس للتوقيع بدلاً من تنفيذه محليًا
    const { data: tokenData, error } = await supabase.functions.invoke('get-firebase-token', {
      body: {
        clientEmail: serviceAccountKey.client_email,
        privateKey: serviceAccountKey.private_key,
        projectId: serviceAccountKey.project_id
      }
    });
    
    if (error) {
      throw new Error(`خطأ في الحصول على رمز الوصول: ${error.message}`);
    }
    
    if (!tokenData?.access_token) {
      throw new Error('لم يتم الحصول على رمز وصول صالح');
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error('خطأ في الحصول على رمز وصول Firebase:', error);
    throw error;
  }
}

// إرسال إشعار إلى مشترك واحد
async function sendNotificationToSubscription(subscription: PushSubscription, payload: NotificationPayload) {
  try {
    // الحصول على رمز الوصول
    const accessToken = await getFirebaseAccessToken();
    
    if (!projectId) {
      throw new Error('معرف مشروع Firebase غير متوفر');
    }
    
    // إعداد بيانات الإشعار
    const notification = {
      title: payload.title,
      body: payload.body,
      image: '/android-chrome-192x192.png'
    };
    
    const message = {
      message: {
        token: subscription.endpoint,
        notification,
        webpush: {
          notification: {
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
          },
          fcm_options: {
            link: payload.url || '/'
          },
          data: {
            url: payload.url || '/',
            type: payload.type || 'general'
          }
        }
      }
    };
    
    // إرسال الإشعار باستخدام واجهة برمجة تطبيقات Firebase Cloud Messaging V1
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(message)
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

