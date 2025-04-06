
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isUsingMySQL } from '@/integrations/database';
import { testConnection } from '@/integrations/mysql/client';

type DatabaseStatus = {
  success: boolean;
  message?: string;
  details?: Record<string, any>;
};

type SyncDirection = 'mysql-to-supabase' | 'supabase-to-mysql';

export const useDatabaseSettings = () => {
  const [useMySQL, setUseMySQLState] = useState<boolean>(() => {
    // قراءة القيمة من localStorage أو التخزين المحلي
    const savedValue = localStorage.getItem('useMySQL');
    return savedValue !== null ? savedValue === 'true' : false;
  });
  
  const [mysqlStatus, setMySQLStatus] = useState<DatabaseStatus>({
    success: false,
    message: 'لم يتم الاختبار بعد'
  });
  
  const [supabaseStatus, setSupabaseStatus] = useState<DatabaseStatus>({
    success: false,
    message: 'لم يتم الاختبار بعد'
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // تطبيق التغييرات عند تغيير قاعدة البيانات المستخدمة
  const setUseMySQL = async (value: boolean) => {
    setIsLoading(true);
    try {
      // تحديث القيمة في localStorage
      localStorage.setItem('useMySQL', value.toString());
      
      // تحديث القيمة في الحالة (state)
      setUseMySQLState(value);
      
      // إعادة اختبار الاتصال
      await testConnections();
      
      return true;
    } catch (error) {
      console.error('خطأ في تعيين قاعدة البيانات:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // اختبار الاتصال بقواعد البيانات
  const testConnections = async () => {
    setIsLoading(true);
    try {
      // اختبار الاتصال بـ MySQL
      console.log('بدء اختبار اتصال MySQL...');
      try {
        const mysqlResult = await testConnection();
        console.log('نتيجة اختبار MySQL:', mysqlResult);
        setMySQLStatus(mysqlResult);
      } catch (mysqlError) {
        console.error('خطأ في اختبار MySQL:', mysqlError);
        setMySQLStatus({
          success: false,
          message: mysqlError instanceof Error ? mysqlError.message : 'حدث خطأ أثناء اختبار اتصال MySQL'
        });
      }
      
      // اختبار الاتصال بـ Supabase
      console.log('بدء اختبار اتصال Supabase...');
      try {
        // استخدام جدول site_settings للاختبار، أو أي جدول آخر موجود في Supabase
        const { data, error } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        console.log('نتيجة اختبار Supabase:', data);
        setSupabaseStatus({
          success: true,
          message: 'تم الاتصال بـ Supabase بنجاح',
          details: {
            count: data
          }
        });
      } catch (supabaseError) {
        console.error('خطأ في اختبار Supabase:', supabaseError);
        setSupabaseStatus({
          success: false,
          message: supabaseError instanceof Error ? supabaseError.message : 'حدث خطأ أثناء اختبار اتصال Supabase'
        });
      }
    } catch (error) {
      console.error('خطأ في اختبار الاتصال:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لعملية المزامنة بين قواعد البيانات
  const syncDatabases = async (direction: SyncDirection) => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    try {
      // قائمة الجداول التي سيتم مزامنتها
      const tables = ['users', 'dreams', 'dream_symbols', 'settings'];
      
      // استدعاء API للمزامنة
      try {
        console.log(`بدء مزامنة البيانات: ${direction}`);
        const response = await fetch('/api/db/sync-databases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            direction, 
            tables,
            config: {
              host: localStorage.getItem('DB_HOST') || "173.249.0.2",
              port: parseInt(localStorage.getItem('DB_PORT') || "3306"),
              user: localStorage.getItem('DB_USER') || "taweel_1",
              password: localStorage.getItem('DB_PASSWORD') || "TLtyrBxFn3F4Hb4y",
              database: localStorage.getItem('DB_NAME') || "taweel_1"
            }
          })
        });

        if (!response.ok) {
          throw new Error(`فشل في المزامنة: ${response.status}`);
        }

        // محاكاة التقدم خلال الانتظار
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress > 95) {
            clearInterval(interval);
          } else {
            setSyncProgress(progress);
          }
        }, 300);

        const result = await response.json();
        
        // إلغاء الفاصل الزمني وضبط التقدم على 100٪
        clearInterval(interval);
        setSyncProgress(100);
        
        return result;
      } catch (error) {
        console.error('خطأ في مزامنة البيانات:', error);
        throw error;
      }
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 1000); // إظهار 100% لثانية واحدة قبل إغلاق المؤشر
    }
  };

  // اختبار الاتصال عند تحميل المكون
  useEffect(() => {
    testConnections();
  }, []);

  return {
    useMySQL,
    setUseMySQL,
    mysqlStatus,
    supabaseStatus,
    isLoading,
    isSyncing,
    syncProgress,
    testConnections,
    syncDatabases
  };
};
