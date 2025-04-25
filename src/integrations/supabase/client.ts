
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kshciumqqwvbaicdlzkz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaGNpdW1xcXd2YmFpY2Rsemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDk2OTEsImV4cCI6MjA1OTA4NTY5MX0.pNBCAVBmPRDhawWZqVbd4vNB-5KmTVbCJ_QbwRaPfpA";

const databaseConnectionOptions = {
  db: {
    schema: 'public',
    host: '173.249.0.2',
    port: 35432,
    database: 'taweel1',
    user: 'taweel1',
    password: 'S_1405salzS_1405salz'
  }
};

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY, 
  { 
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: databaseConnectionOptions.db
  }
);

// إضافة دالة للتحقق من الاتصال
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('خطأ في الاتصال بقاعدة البيانات:', error);
      return false;
    }

    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    return true;
  } catch (err) {
    console.error('حدث خطأ أثناء محاولة الاتصال:', err);
    return false;
  }
};

// يمكنك استدعاء هذه الدالة عند بدء تشغيل التطبيق
checkDatabaseConnection();
