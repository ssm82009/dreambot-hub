
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isUsingMySQL, mysqlDB } from '@/integrations/database';

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
      const mysqlResult = await mysqlDB.testConnection();
      setMySQLStatus(mysqlResult);
      
      // اختبار الاتصال بـ Supabase
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        setSupabaseStatus({
          success: true,
          message: 'تم الاتصال بـ Supabase بنجاح',
          details: {
            count: data
          }
        });
      } catch (error) {
        console.error('خطأ في اختبار Supabase:', error);
        setSupabaseStatus({
          success: false,
          message: error instanceof Error ? error.message : String(error)
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
      const totalTables = tables.length;
      
      // استدعاء API للمزامنة
      try {
        const response = await fetch('/api/db/sync-databases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction, tables })
        });

        if (!response.ok) {
          throw new Error(`فشل في المزامنة: ${response.statusText}`);
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
