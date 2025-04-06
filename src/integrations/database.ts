

import { supabase } from './supabase/client';
import { mysqlDB } from './mysql/client';

// تحديد أي قاعدة بيانات سيتم استخدامها (يتم قراءته من التخزين المحلي إذا كان موجوداً)
const getUseMySQL = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedValue = localStorage.getItem('useMySQL');
    return savedValue !== null ? savedValue === 'true' : true;
  }
  return true; // القيمة الافتراضية هي true (استخدام MySQL)
};

const USE_MYSQL = getUseMySQL();

// صدّر كائن قاعدة البيانات المناسب
export const db = USE_MYSQL ? mysqlDB : { supabase };

// دالة للتحقق من الاتصال بقاعدة البيانات المستخدمة
export const checkDatabaseConnection = async () => {
  if (USE_MYSQL) {
    return await mysqlDB.testConnection();
  } else {
    // التحقق من اتصال Supabase
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
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
      console.error('فشل الاتصال بـ Supabase:', error);
      return {
        success: false,
        message: 'فشل الاتصال بـ Supabase',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// اختبار الاتصال عند تحميل الملف
checkDatabaseConnection()
  .then(connected => {
    if (connected.success) {
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!', connected.details);
    } else {
      console.error('❌ فشل الاتصال بقاعدة البيانات!', connected.message);
    }
  });
