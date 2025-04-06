
import { supabase } from './supabase/client';
import { mysqlDB } from './mysql/client';

// تحديد أي قاعدة بيانات سيتم استخدامها
const USE_MYSQL = true; // يمكن تعديله إلى false لاستخدام Supabase

// صدّر كائن قاعدة البيانات المناسب
export const db = USE_MYSQL ? mysqlDB : { supabase };

// دالة للتحقق من الاتصال بقاعدة البيانات المستخدمة
export const checkDatabaseConnection = async () => {
  if (USE_MYSQL) {
    return await mysqlDB.testConnection();
  } else {
    // التحقق من اتصال Supabase
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      console.log('تم الاتصال بـ Supabase بنجاح!');
      return true;
    } catch (error) {
      console.error('فشل الاتصال بـ Supabase:', error);
      return false;
    }
  }
};

// اختبار الاتصال عند تحميل الملف
checkDatabaseConnection()
  .then(connected => {
    if (connected) {
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
    } else {
      console.error('❌ فشل الاتصال بقاعدة البيانات!');
    }
  });
