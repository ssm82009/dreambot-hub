
import { useState, useEffect } from 'react';
import { mysqlDB } from '@/integrations/mysql/client';
import { supabase } from '@/integrations/supabase/client';
import { db, checkDatabaseConnection } from '@/integrations/database';

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
    return savedValue !== null ? savedValue === 'true' : true;
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
      
      // إعادة تحميل الصفحة لتطبيق التغييرات
      // window.location.reload();
      
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
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setSyncProgress(Math.round((i / totalTables) * 50)); // الوصول للنصف في مرحلة القراءة
        
        // جلب البيانات من المصدر
        let sourceData;
        if (direction === 'mysql-to-supabase') {
          const query = `SELECT * FROM ${table}`;
          sourceData = await mysqlDB.executeQuery(query);
        } else {
          const { data, error } = await supabase.from(table).select('*');
          if (error) throw error;
          sourceData = data;
        }
        
        setSyncProgress(Math.round(50 + (i / totalTables) * 30)); // الوصول للثمانين في مرحلة المعالجة
        
        // كتابة البيانات إلى الوجهة
        if (direction === 'mysql-to-supabase') {
          // حذف البيانات الحالية من الوجهة (Supabase) أولاً
          const { error: deleteError } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (deleteError) throw deleteError;
          
          // إدخال البيانات الجديدة إلى Supabase
          if (sourceData && sourceData.length > 0) {
            const { error: insertError } = await supabase.from(table).insert(sourceData);
            if (insertError) throw insertError;
          }
        } else {
          // مزامنة البيانات إلى MySQL
          // حذف البيانات الحالية من الوجهة (MySQL) أولاً
          const deleteQuery = `DELETE FROM ${table}`;
          await mysqlDB.executeQuery(deleteQuery);
          
          // إدخال البيانات الجديدة إلى MySQL
          if (sourceData && sourceData.length > 0) {
            for (const item of sourceData) {
              const columns = Object.keys(item).join(', ');
              const placeholders = Object.keys(item).map(() => '?').join(', ');
              const values = Object.values(item);
              
              const insertQuery = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
              await mysqlDB.executeQuery(insertQuery, values);
            }
          }
        }
        
        setSyncProgress(Math.round(80 + (i / totalTables) * 20)); // الوصول للمئة بعد الانتهاء
      }
      
      setSyncProgress(100);
      return true;
    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
      throw error;
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 1000); // إظهار 100% لثانية واحدة قبل إغلاق المؤشر
    }
  };

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
