
import { supabase } from './supabase/client';

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
export const db = isBrowser ? { supabase } : { supabase };

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
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return {
      success: false,
      message: 'فشل الاتصال بقاعدة البيانات',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// تعريف موجز للدوال التي ستكون متاحة عبر وكيل API
export const mysqlDB = {
  testConnection: async () => {
    try {
      // نحتاج إلى إرسال بيانات الاتصال من LocalStorage عند استدعاء API
      const config = {
        host: localStorage.getItem('DB_HOST') || "173.249.0.2",
        port: parseInt(localStorage.getItem('DB_PORT') || "3306"),
        user: localStorage.getItem('DB_USER') || "taweel_1",
        password: localStorage.getItem('DB_PASSWORD') || "TLtyrBxFn3F4Hb4y",
        database: localStorage.getItem('DB_NAME') || "taweel_1"
      };
      
      // بدلاً من الاتصال المباشر بـ MySQL، سنستخدم API وسيطة
      const response = await fetch('/api/db/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في اختبار اتصال MySQL:', error);
      return {
        success: false,
        message: `فشل الاتصال بقاعدة بيانات MySQL: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  checkRequiredTables: async () => {
    try {
      // استدعاء API للتحقق من الجداول
      const config = {
        host: localStorage.getItem('DB_HOST') || "173.249.0.2",
        port: parseInt(localStorage.getItem('DB_PORT') || "3306"),
        user: localStorage.getItem('DB_USER') || "taweel_1",
        password: localStorage.getItem('DB_PASSWORD') || "TLtyrBxFn3F4Hb4y",
        database: localStorage.getItem('DB_NAME') || "taweel_1"
      };
      
      const response = await fetch('/api/db/check-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في التحقق من الجداول:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  executeQuery: async (query, params = []) => {
    try {
      // استدعاء API لتنفيذ استعلام
      const config = {
        host: localStorage.getItem('DB_HOST') || "173.249.0.2",
        port: parseInt(localStorage.getItem('DB_PORT') || "3306"),
        user: localStorage.getItem('DB_USER') || "taweel_1",
        password: localStorage.getItem('DB_PASSWORD') || "TLtyrBxFn3F4Hb4y",
        database: localStorage.getItem('DB_NAME') || "taweel_1"
      };
      
      const response = await fetch('/api/db/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, params, config })
      });
      
      if (!response.ok) {
        throw new Error(`خطأ في استجابة الخادم: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('خطأ في تنفيذ الاستعلام:', error);
      throw error;
    }
  }
};

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
