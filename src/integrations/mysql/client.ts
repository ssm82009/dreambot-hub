
import mysql from 'mysql2/promise';

// معلومات الاتصال بقاعدة البيانات MySQL
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "taweel_1";
const DB_PASSWORD = process.env.DB_PASSWORD || "TLtyrBxFn3F4Hb4y";
const DB_NAME = process.env.DB_NAME || "taweel_1";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

// إنشاء مجمع اتصالات (connection pool) لزيادة الأداء
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// دالة للتحقق من الاتصال
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('تم الاتصال بقاعدة البيانات MySQL بنجاح!');
    connection.release();
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات MySQL:', error);
    return false;
  }
};

// دالة لتنفيذ استعلامات SQL
export const executeQuery = async <T>(query: string, params: any[] = []): Promise<T[]> => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('خطأ في تنفيذ الاستعلام:', error);
    throw error;
  }
};

// مثال لدالات للتعامل مع المستخدمين (يمكن توسيعها حسب الحاجة)
export const usersService = {
  // جلب جميع المستخدمين
  async getAllUsers() {
    return executeQuery('SELECT * FROM users');
  },
  
  // جلب مستخدم واحد بواسطة المعرف
  async getUserById(id: string) {
    return executeQuery('SELECT * FROM users WHERE id = ?', [id]);
  },
  
  // إنشاء مستخدم جديد
  async createUser(userData: any) {
    const { email, full_name, password_hash } = userData;
    return executeQuery(
      'INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)',
      [email, full_name, password_hash]
    );
  },
  
  // التحقق من تسجيل الدخول
  async verifyLogin(email: string, passwordHash: string) {
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
      [email, passwordHash]
    );
    return users.length > 0 ? users[0] : null;
  }
};

// دالات للتعامل مع الأحلام
export const dreamsService = {
  // جلب جميع الأحلام لمستخدم معين
  async getUserDreams(userId: string) {
    return executeQuery('SELECT * FROM dreams WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  },
  
  // جلب حلم واحد بواسطة المعرف
  async getDreamById(id: string) {
    return executeQuery('SELECT * FROM dreams WHERE id = ?', [id]);
  },
  
  // إنشاء حلم جديد
  async createDream(dreamData: any) {
    const { user_id, dream_text, interpretation, tags } = dreamData;
    return executeQuery(
      'INSERT INTO dreams (user_id, dream_text, interpretation, tags) VALUES (?, ?, ?, ?)',
      [user_id, dream_text, interpretation, JSON.stringify(tags || [])]
    );
  }
};

// دالات للتعامل مع رموز الأحلام
export const dreamSymbolsService = {
  // جلب جميع الرموز
  async getAllSymbols() {
    return executeQuery('SELECT * FROM dream_symbols');
  },
  
  // جلب رمز واحد بواسطة المعرف
  async getSymbolById(id: string) {
    return executeQuery('SELECT * FROM dream_symbols WHERE id = ?', [id]);
  },
  
  // إنشاء رمز جديد
  async createSymbol(symbolData: any) {
    const { symbol, interpretation, category } = symbolData;
    return executeQuery(
      'INSERT INTO dream_symbols (symbol, interpretation, category) VALUES (?, ?, ?)',
      [symbol, interpretation, category]
    );
  }
};

// تعريف نوع لتحديد هيكل بيانات الإعدادات
type SettingRecord = {
  id: string;
  setting_type: string;
  value: string;
  created_at?: string;
  updated_at?: string;
};

// دالات للتعامل مع إعدادات الموقع
export const settingsService = {
  // جلب إعدادات الموقع
  async getSettings(settingType: string) {
    const settings = await executeQuery<SettingRecord>(
      'SELECT * FROM settings WHERE setting_type = ?',
      [settingType]
    );
    return settings.length > 0 ? JSON.parse(settings[0].value) : null;
  },
  
  // تحديث إعدادات الموقع
  async updateSettings(settingType: string, value: any) {
    const settings = await executeQuery<SettingRecord>(
      'SELECT * FROM settings WHERE setting_type = ?',
      [settingType]
    );
    
    if (settings.length > 0) {
      return executeQuery(
        'UPDATE settings SET value = ? WHERE setting_type = ?',
        [JSON.stringify(value), settingType]
      );
    } else {
      return executeQuery(
        'INSERT INTO settings (setting_type, value) VALUES (?, ?)',
        [settingType, JSON.stringify(value)]
      );
    }
  }
};

// صدّر المجمع وخدمات قاعدة البيانات
export const mysqlDB = {
  pool,
  testConnection,
  executeQuery,
  users: usersService,
  dreams: dreamsService,
  dreamSymbols: dreamSymbolsService,
  settings: settingsService
};
