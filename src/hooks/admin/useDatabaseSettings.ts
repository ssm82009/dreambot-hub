
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getActiveDatabaseType, setActiveDatabase, DatabaseType } from '@/integrations/database';
import { testConnection as testMysqlConnection } from '@/integrations/mysql/client';
import { testConnection as testPgsqlConnection } from '@/integrations/pgsql/client';

type DatabaseStatus = {
  success: boolean;
  message?: string;
  details?: Record<string, any>;
};

type SyncDirection = 'secondary-to-supabase' | 'supabase-to-secondary';

export const useDatabaseSettings = () => {
  const [activeDatabase, setActiveDatabaseState] = useState<DatabaseType>(() => {
    // قراءة القيمة من localStorage أو التخزين المحلي
    return getActiveDatabaseType();
  });
  
  const [mysqlStatus, setMySQLStatus] = useState<DatabaseStatus>({
    success: false,
    message: 'لم يتم الاختبار بعد'
  });
  
  const [pgsqlStatus, setPgSQLStatus] = useState<DatabaseStatus>({
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
  const setDatabaseType = async (type: DatabaseType) => {
    setIsLoading(true);
    try {
      // تحديث القيمة في الخدمة
      setActiveDatabase(type);
      
      // تحديث القيمة في الحالة (state)
      setActiveDatabaseState(type);
      
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
        const mysqlResult = await testMysqlConnection();
        console.log('نتيجة اختبار MySQL:', mysqlResult);
        setMySQLStatus(mysqlResult);
      } catch (mysqlError) {
        console.error('خطأ في اختبار MySQL:', mysqlError);
        setMySQLStatus({
          success: false,
          message: mysqlError instanceof Error ? mysqlError.message : 'حدث خطأ أثناء اختبار اتصال MySQL'
        });
      }
      
      // اختبار الاتصال بـ PostgreSQL
      console.log('بدء اختبار اتصال PostgreSQL...');
      try {
        const pgsqlResult = await testPgsqlConnection();
        console.log('نتيجة اختبار PostgreSQL:', pgsqlResult);
        setPgSQLStatus(pgsqlResult);
      } catch (pgsqlError) {
        console.error('خطأ في اختبار PostgreSQL:', pgsqlError);
        setPgSQLStatus({
          success: false,
          message: pgsqlError instanceof Error ? pgsqlError.message : 'حدث خطأ أثناء اختبار اتصال PostgreSQL'
        });
      }
      
      // اختبار الاتصال بـ Supabase
      console.log('بدء اختبار اتصال Supabase...');
      try {
        // استخدام جدول theme_settings للاختبار
        const { data, error } = await supabase.from('theme_settings').select('count', { count: 'exact', head: true });
        
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
      
      // تحديد نوع قاعدة البيانات الثانوية
      const secondaryDbType = activeDatabase === 'supabase' ? 
        (pgsqlStatus.success ? 'pgsql' : 'mysql') : 
        activeDatabase;
      
      // استدعاء API للمزامنة
      try {
        console.log(`بدء مزامنة البيانات: ${direction}, من ${secondaryDbType}`);
        // هنا نحدد الإندبوينت بناءً على نوع قاعدة البيانات
        const endpoint = secondaryDbType === 'pgsql' ? 
          '/api/db/sync-pg-databases' : 
          '/api/db/sync-databases';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            direction, 
            tables,
            dbType: secondaryDbType,
            config: secondaryDbType === 'pgsql' ? {
              host: localStorage.getItem('PGSQL_HOST') || "127.0.0.1",
              port: parseInt(localStorage.getItem('PGSQL_PORT') || "5432"),
              user: localStorage.getItem('PGSQL_USER') || "taweel_1",
              password: localStorage.getItem('PGSQL_PASSWORD') || "S_140Saiz",
              database: localStorage.getItem('PGSQL_NAME') || "taweel_1",
              ssl: localStorage.getItem('PGSQL_SSL') === 'true'
            } : {
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
    activeDatabase,
    setDatabaseType,
    mysqlStatus,
    pgsqlStatus,
    supabaseStatus,
    isLoading,
    isSyncing,
    syncProgress,
    testConnections,
    syncDatabases
  };
};
