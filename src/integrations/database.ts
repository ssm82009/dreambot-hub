
import { supabase } from './supabase/client';
import { mysqlDBClient } from './mysql/client';
import { pgsqlDBClient } from './pgsql/client';

// تحديد ما إذا كان الكود يعمل في المتصفح أم على الخادم
const isBrowser = typeof window !== 'undefined';

// أنواع قواعد البيانات المدعومة
export type DatabaseType = 'supabase' | 'mysql' | 'pgsql';

// في بيئة المتصفح، استخدم Supabase افتراضياً
// في بيئة الخادم، يمكن استخدام أي من قواعد البيانات المدعومة
const getActiveDatabase = (): DatabaseType => {
  if (isBrowser) {
    const savedValue = localStorage.getItem('activeDatabase');
    // في المتصفح، نقرأ الإعداد من localStorage
    return (savedValue as DatabaseType) || 'supabase';
  }
  return 'supabase'; // الافتراضي في الخادم هو استخدام Supabase
};

// صدّر كائن قاعدة البيانات المناسب
export const db = isBrowser ? 
  { 
    supabase,
    mysqlDB: mysqlDBClient,
    pgsqlDB: pgsqlDBClient
  } : 
  { supabase };

// تحديد نوع قاعدة البيانات المستخدمة حالياً
export const getActiveDatabaseType = (): DatabaseType => {
  if (isBrowser) {
    const savedValue = localStorage.getItem('activeDatabase');
    return (savedValue as DatabaseType) || 'supabase';
  }
  return 'supabase';
};

// دالة لتعيين قاعدة البيانات النشطة
export const setActiveDatabase = (type: DatabaseType): void => {
  if (isBrowser) {
    localStorage.setItem('activeDatabase', type);
  }
};

// دالة للتحقق من الاتصال بقاعدة البيانات المستخدمة
export const checkDatabaseConnection = async () => {
  try {
    const activeDbType = getActiveDatabaseType();
    
    switch (activeDbType) {
      case 'mysql':
        return await mysqlDBClient.testConnection();
      case 'pgsql':
        return await pgsqlDBClient.testConnection();
      case 'supabase':
      default:
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
    }
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return {
      success: false,
      message: 'فشل الاتصال بقاعدة البيانات',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// تصدير واجهات قواعد البيانات
export const mysqlDB = mysqlDBClient;
export const pgsqlDB = pgsqlDBClient;

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
