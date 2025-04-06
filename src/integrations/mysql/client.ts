import { mysqlConfig } from './config';

// دالة للتحقق من الاتصال
export const testConnection = async () => {
  try {
    // في بيئة المتصفح، نستخدم محاكاة للاختبار بدلاً من API حقيقية
    // لأن API ال 404 غير موجودة حالياً
    
    // استرجاع بيانات الاتصال من التخزين المحلي
    const config = {
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database
    };
    
    console.log("محاولة اختبار اتصال MySQL مع:", {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    // محاكاة استجابة ناجحة لتجنب الأخطاء 404
    // في النسخة الإنتاجية، يجب استبدال هذا بطلب API حقيقي
    
    // تحقق من تعبئة بيانات الاتصال الأساسية
    if (!config.host || !config.user || !config.database) {
      return {
        success: false,
        message: 'بيانات الاتصال غير مكتملة',
        error: 'يرجى التحقق من إدخال جميع بيانات الاتصال المطلوبة (المضيف، اسم المستخدم، قاعدة البيانات)',
        details: {
          host: config.host,
          port: config.port,
          user: config.user,
          database: config.database
        }
      };
    }
    
    // محاكاة نجاح الاتصال للاختبار
    return {
      success: true,
      message: 'تم اختبار الاتصال بقاعدة البيانات MySQL بنجاح! (محاكاة)',
      details: {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database
      }
    };
    
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات MySQL:', error);
    return {
      success: false,
      message: 'فشل الاتصال بقاعدة البيانات MySQL',
      error: error instanceof Error ? error.message : String(error),
      details: {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        user: mysqlConfig.user,
        database: mysqlConfig.database
      }
    };
  }
};

// دالة للتحقق من وجود الجداول المطلوبة
export const checkRequiredTables = async () => {
  try {
    const response = await fetch('/api/db/check-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          host: mysqlConfig.host,
          port: mysqlConfig.port,
          user: mysqlConfig.user,
          password: mysqlConfig.password,
          database: mysqlConfig.database
        }
      })
    });

    if (!response.ok) {
      throw new Error(`فشل التحقق من الجداول: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('خطأ في التحقق من الجداول:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// دالة لتنفيذ استعلامات SQL
export const executeQuery = async <T>(query: string, params: any[] = []): Promise<T[]> => {
  try {
    const response = await fetch('/api/db/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        params,
        config: {
          host: mysqlConfig.host,
          port: mysqlConfig.port,
          user: mysqlConfig.user,
          password: mysqlConfig.password,
          database: mysqlConfig.database
        }
      })
    });

    if (!response.ok) {
      throw new Error(`فشل تنفيذ الاستعلام: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('خطأ في تنفيذ الاستعلام:', error);
    throw error;
  }
};

// تعريف نوع لتحديد هيكل بيانات المستخدمين
type User = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
};

// مثال لدالات للتعامل مع المستخدمين (يمكن توسيعها حسب الحاجة)
export const usersService = {
  // جلب جميع المستخدمين
  async getAllUsers() {
    return executeQuery<User>('SELECT * FROM users');
  },
  
  // جلب مستخدم واحد بواسطة المعرف
  async getUserById(id: string) {
    return executeQuery<User>('SELECT * FROM users WHERE id = ?', [id]);
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
    const users = await executeQuery<User>(
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

// صدّر المجمع وخدمات قاعدة البيانات با اسم مختلف لتجنب التعارض
export const mysqlDBClient = {
  testConnection,
  checkRequiredTables,
  executeQuery,
  users: usersService,
  dreams: dreamsService,
  dreamSymbols: dreamSymbolsService,
  settings: settingsService
};
