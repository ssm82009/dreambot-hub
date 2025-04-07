
// إنشاء API endpoint لمزامنة قواعد البيانات
// يمكن تطوير هذه الوظيفة لاستخدامها في البيئة الإنتاجية

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { direction, tables, config } = req.body;

    // التحقق من البيانات المطلوبة
    if (!direction || !tables || !tables.length || !config) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: { direction: 'mysql-to-supabase | supabase-to-mysql', tables: 'array', config: 'object' }
      });
    }

    // تحقق من بيانات اتصال MySQL
    const { host, port, user, password, database } = config;
    if (!host || !user || !password || !database) {
      return res.status(400).json({ error: 'MySQL connection details incomplete' });
    }

    // إنشاء اتصال MySQL
    let mysqlConnection;
    try {
      mysqlConnection = await mysql.createConnection({
        host,
        port: port || 3306,
        user,
        password,
        database
      });
      console.log('MySQL connection established');
    } catch (mysqlError) {
      return res.status(500).json({ 
        error: 'Failed to connect to MySQL database',
        details: mysqlError.message 
      });
    }

    // إنشاء اتصال Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL || "https://kshciumqqwvbaicdlzkz.supabase.co";
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaGNpdW1xcXd2YmFpY2Rsemt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDk2OTEsImV4cCI6MjA1OTA4NTY5MX0.pNBCAVBmPRDhawWZqVbd4vNB-5KmTVbCJ_QbwRaPfpA";
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // إعداد نتائج المزامنة
    const results = {
      success: true,
      direction,
      tables: [],
      syncedItems: 0,
      errors: []
    };

    // تنفيذ المزامنة
    if (direction === 'mysql-to-supabase') {
      // المزامنة من MySQL إلى Supabase
      for (const table of tables) {
        try {
          console.log(`Syncing ${table} from MySQL to Supabase...`);
          
          // جلب البيانات من MySQL
          const [rows] = await mysqlConnection.query(`SELECT * FROM ${table}`);
          
          if (rows.length === 0) {
            results.tables.push({ name: table, count: 0, status: 'No data to sync' });
            continue;
          }
          
          // حذف البيانات من Supabase قبل الإدراج (اختياري، يمكن إزالة هذا إذا كنت تريد الدمج بدلاً من الاستبدال)
          const { error: deleteError } = await supabase.from(table).delete().neq('id', 'none');
          if (deleteError) {
            throw new Error(`Failed to clear Supabase table: ${deleteError.message}`);
          }
          
          // إدراج البيانات في Supabase
          const { data, error } = await supabase.from(table).insert(rows);
          
          if (error) {
            throw new Error(`Failed to insert data: ${error.message}`);
          }
          
          results.tables.push({ name: table, count: rows.length, status: 'success' });
          results.syncedItems += rows.length;
        } catch (tableError) {
          console.error(`Error syncing table ${table}:`, tableError);
          results.errors.push({ table, error: tableError.message });
          results.tables.push({ name: table, status: 'error', error: tableError.message });
        }
      }
    } else if (direction === 'supabase-to-mysql') {
      // المزامنة من Supabase إلى MySQL
      for (const table of tables) {
        try {
          console.log(`Syncing ${table} from Supabase to MySQL...`);
          
          // جلب البيانات من Supabase
          const { data: rows, error } = await supabase.from(table).select('*');
          
          if (error) {
            throw new Error(`Failed to fetch data from Supabase: ${error.message}`);
          }
          
          if (rows.length === 0) {
            results.tables.push({ name: table, count: 0, status: 'No data to sync' });
            continue;
          }
          
          // حذف البيانات من MySQL قبل الإدراج
          await mysqlConnection.query(`DELETE FROM ${table}`);
          
          // إعداد استعلام الإدراج
          const columns = Object.keys(rows[0]).join(', ');
          const placeholders = Array(Object.keys(rows[0]).length).fill('?').join(', ');
          
          // إدراج البيانات في MySQL
          const statement = await mysqlConnection.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);
          
          for (const row of rows) {
            // تحويل أي قيم غير متوافقة
            const values = Object.values(row).map(val => {
              if (typeof val === 'object' && val !== null) {
                return JSON.stringify(val);
              }
              return val;
            });
            
            await statement.execute(values);
          }
          
          results.tables.push({ name: table, count: rows.length, status: 'success' });
          results.syncedItems += rows.length;
        } catch (tableError) {
          console.error(`Error syncing table ${table}:`, tableError);
          results.errors.push({ table, error: tableError.message });
          results.tables.push({ name: table, status: 'error', error: tableError.message });
        }
      }
    } else {
      return res.status(400).json({ error: 'Invalid direction' });
    }

    // إغلاق اتصال MySQL
    await mysqlConnection.end();
    
    // إعداد الرسالة الختامية
    let message = '';
    if (results.errors.length) {
      results.success = false;
      message = `تمت مزامنة ${results.syncedItems} سجل بنجاح من ${results.tables.length - results.errors.length}/${results.tables.length} جداول مع ${results.errors.length} أخطاء`;
    } else {
      message = `تمت مزامنة ${results.syncedItems} سجل بنجاح من ${results.tables.length} جداول`;
    }
    
    results.message = message;
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('Error in database sync:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
