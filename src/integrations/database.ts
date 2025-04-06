
import { supabase } from './supabase/client';
import { mysqlDBClient } from './mysql/client';

// تحديد ما إذا كان الكود يعمل في المتصفح أم على الخادم
const isBrowser = typeof window !== 'undefined';

// في بيئة المتصفح، استخدم Supabase فقط
// في بيئة الخادم، يمكن استخدام MySQL أو Supabase
const getUseMySQL = (): boolean => {
  if (isBrowser) {
    const savedValue = localStorage.getItem('useMySQL');
    // في المتصفح، نقرأ الإعداد من localStorage لكن لا نستخدم MySQL مباشرة
    return savedValue !== null ? savedValue === 'true' : false;
  }
  return false; // الافتراضي في المتصفح هو استخدام Supabase
};

// صدّر كائن قاعدة البيانات المناسب
export const db = isBrowser ? { supabase, mysqlDB: mysqlDBClient } : { supabase };

// تحديد نوع قاعدة البيانات المستخدمة حالياً
export const isUsingMySQL = (): boolean => {
  if (isBrowser) {
    const savedValue = localStorage.getItem('useMySQL');
    return savedValue !== null ? savedValue === 'true' : false;
  }
  return false;
};

// دالة للتحقق من الاتصال بقاعدة البيانات المستخدمة
export const checkDatabaseConnection = async () => {
  try {
    // في المتصفح، نختبر فقط اتصال Supabase
    const { data, error } = await supabase.from('theme_settings').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('تم الاتصال بـ Supabase بنجاح!');
    return {
      success: true,
      message: 'تم الاتصال بـ Supabase بنجاح!',
      details: {
        data
      }
    };
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return {
      success: false,
      message: 'فشل الاتصال بقاعدة البيانات',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// تصدير واجهة mysqlDB من ملف client 
export const mysqlDB = mysqlDBClient;

// اختبار الاتصال عند تحميل الملف في بيئة المتصفح فقط
if (isBrowser) {
  checkDatabaseConnection()
    .then(connected => {
      if (connected.success) {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!', connected.details);
      } else {
        console.error('❌ فشل الاتصال بقاعدة البيانات!', connected.message);
      }
    });
}
