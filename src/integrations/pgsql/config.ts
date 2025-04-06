
/**
 * إعدادات الاتصال بقاعدة بيانات PostgreSQL
 * يمكنك تعديل هذه الإعدادات حسب بيئة التشغيل الخاصة بك
 */

// التحقق من وجود بيئة العمل
const getEnv = (key: string, defaultValue: string): string => {
  // استخدام localStorage في بيئة المتصفح بدلاً من process.env
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`PGSQL_${key}`) || defaultValue;
  }
  // في بيئة الخادم، يمكن استخدام process.env إذا كان متاحاً
  return (typeof process !== 'undefined' && process.env && process.env[`PGSQL_${key}`]) 
    || defaultValue;
};

// إعدادات الاتصال بقاعدة البيانات PostgreSQL
export const pgsqlConfig = {
  // عنوان خادم قاعدة البيانات
  host: getEnv('HOST', "127.0.0.1"),
  // رقم المنفذ لقاعدة البيانات
  port: parseInt(getEnv('PORT', "5432")),
  // اسم المستخدم
  user: getEnv('USER', "taweel_1"),
  // كلمة المرور
  password: getEnv('PASSWORD', "S_140Saiz"),
  // اسم قاعدة البيانات
  database: getEnv('NAME', "taweel_1"),
  // خيارات إضافية
  ssl: false
};

// دالة للحصول على إعدادات قاعدة البيانات الحالية
export const getDatabaseConfig = () => {
  return {
    host: pgsqlConfig.host,
    port: pgsqlConfig.port,
    user: pgsqlConfig.user,
    database: pgsqlConfig.database,
    // لأسباب أمنية، لا نعيد كلمة المرور كاملة
    password: pgsqlConfig.password ? "********" : "",
    ssl: pgsqlConfig.ssl
  };
};

// دالة لتحديث إعدادات الاتصال
export const updateDatabaseConfig = (newConfig: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}) => {
  // تحديث الإعدادات
  if (newConfig.host) {
    pgsqlConfig.host = newConfig.host;
    localStorage.setItem('PGSQL_HOST', newConfig.host);
  }
  if (newConfig.port) {
    pgsqlConfig.port = newConfig.port;
    localStorage.setItem('PGSQL_PORT', newConfig.port.toString());
  }
  if (newConfig.user) {
    pgsqlConfig.user = newConfig.user;
    localStorage.setItem('PGSQL_USER', newConfig.user);
  }
  if (newConfig.database) {
    pgsqlConfig.database = newConfig.database;
    localStorage.setItem('PGSQL_NAME', newConfig.database);
  }
  if (newConfig.password) {
    pgsqlConfig.password = newConfig.password;
    localStorage.setItem('PGSQL_PASSWORD', newConfig.password);
  }
  if (newConfig.ssl !== undefined) {
    pgsqlConfig.ssl = newConfig.ssl;
    localStorage.setItem('PGSQL_SSL', newConfig.ssl.toString());
  }
  
  return getDatabaseConfig();
};
