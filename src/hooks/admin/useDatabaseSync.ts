
import { useState } from 'react';
import { toast } from 'sonner';
import { mysqlConfig } from '@/integrations/mysql/config';

type SyncDirection = 'mysql-to-supabase' | 'supabase-to-mysql';
type SyncResults = {
  success: boolean;
  direction: SyncDirection;
  tables: Array<{ 
    name: string; 
    count?: number; 
    status: 'success' | 'error' | 'No data to sync';
    error?: string;
  }>;
  syncedItems: number;
  message: string;
  errors?: { table: string; error: string }[];
}

export const useDatabaseSync = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [lastSyncResults, setLastSyncResults] = useState<SyncResults | null>(null);

  // قائمة الجداول المراد مزامنتها
  const availableTables = [
    'ai_settings',
    'custom_pages',
    'dream_symbols',
    'dreams',
    'interpretation_settings',
    'navbar_links',
    'payment_invoices',
    'payment_sessions',
    'payment_settings',
    'pricing_settings',
    'site_settings', 
    'theme_settings',
    'ticket_replies',
    'tickets',
    'users'
  ];

  // وظيفة مزامنة قواعد البيانات
  const syncDatabases = async (direction: SyncDirection, tables = availableTables) => {
    // التحقق من البيانات المدخلة
    if (!tables || !tables.length) {
      toast.error('يرجى اختيار على الأقل جدول واحد للمزامنة');
      return null;
    }
    
    setIsSyncing(true);
    setSyncProgress(5);
    
    try {
      console.log(`بدء مزامنة البيانات: ${direction}`);
      
      // استرجاع بيانات الاتصال بقاعدة البيانات
      const config = {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database
      };
      
      // محاكاة التقدم خلال الانتظار
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 5);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // استدعاء API المزامنة
      const response = await fetch('/api/db/sync-databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, tables, config })
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في المزامنة: ${response.status} - ${errorText}`);
      }
      
      const results: SyncResults = await response.json();
      setSyncProgress(100);
      
      // إظهار رسالة نجاح أو فشل
      if (results.success) {
        toast.success(results.message);
      } else {
        toast.error(results.message);
        console.error('أخطاء المزامنة:', results.errors);
      }
      
      setLastSyncResults(results);
      return results;
      
    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
      toast.error(`فشلت عملية المزامنة: ${error.message}`);
      setSyncProgress(0);
      return null;
    } finally {
      // إظهار 100% لثانية واحدة قبل إعادة التعيين
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  };

  return {
    availableTables,
    isSyncing,
    syncProgress,
    syncDatabases,
    lastSyncResults
  };
};
