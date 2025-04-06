
/**
 * إعدادات الاتصال بقاعدة بيانات MySQL
 * يمكنك تعديل هذه الإعدادات حسب بيئة التشغيل الخاصة بك
 */

// التحقق من وجود بيئة العمل
const getEnv = (key: string, defaultValue: string): string => {
  // استخدام localStorage في بيئة المتصفح بدلاً من process.env
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`DB_${key}`) || defaultValue;
  }
  // في بيئة الخادم، يمكن استخدام process.env إذا كان متاحاً
  return (typeof process !== 'undefined' && process.env && process.env[`DB_${key}`]) || defaultValue;
};

// إعدادات الاتصال بقاعدة البيانات MySQL
export const mysqlConfig = {
  // عنوان خادم قاعدة البيانات
  host: getEnv('HOST', "173.249.0.2"),
  // رقم المنفذ لقاعدة البيانات
  port: parseInt(getEnv('PORT', "3306")),
  // اسم المستخدم
  user: getEnv('USER', "taweel_1"),
  // كلمة المرور
  password: getEnv('PASSWORD', "TLtyrBxFn3F4Hb4y"),
  // اسم قاعدة البيانات
  database: getEnv('NAME', "taweel_1"),
  // إعدادات مجمع الاتصالات
  pool: {
    // عدد الاتصالات في المجمع
    connectionLimit: 10,
    // انتظار الاتصالات إذا وصلنا للحد الأقصى
    waitForConnections: true,
    // حد الاتصالات في قائمة الانتظار (0 تعني لا حدود)
    queueLimit: 0
  }
};

// دالة للحصول على إعدادات قاعدة البيانات الحالية
export const getDatabaseConfig = () => {
  return {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    database: mysqlConfig.database,
    // لأسباب أمنية، لا نعيد كلمة المرور كاملة
    password: mysqlConfig.password ? "********" : "",
    connectionLimit: mysqlConfig.pool.connectionLimit
  };
};

// دالة لتحديث إعدادات الاتصال
export const updateDatabaseConfig = (newConfig: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  connectionLimit?: number;
}) => {
  // في بيئة الإنتاج، قد ترغب في تخزين هذه الإعدادات في مكان آمن
  // مثل متغيرات البيئة أو قاعدة بيانات أخرى
  
  // تحديث الإعدادات
  if (newConfig.host) {
    mysqlConfig.host = newConfig.host;
    localStorage.setItem('DB_HOST', newConfig.host);
  }
  if (newConfig.port) {
    mysqlConfig.port = newConfig.port;
    localStorage.setItem('DB_PORT', newConfig.port.toString());
  }
  if (newConfig.user) {
    mysqlConfig.user = newConfig.user;
    localStorage.setItem('DB_USER', newConfig.user);
  }
  if (newConfig.database) {
    mysqlConfig.database = newConfig.database;
    localStorage.setItem('DB_NAME', newConfig.database);
  }
  if (newConfig.password) {
    mysqlConfig.password = newConfig.password;
    localStorage.setItem('DB_PASSWORD', newConfig.password);
  }
  if (newConfig.connectionLimit) {
    mysqlConfig.pool.connectionLimit = newConfig.connectionLimit;
    localStorage.setItem('DB_CONNECTION_LIMIT', newConfig.connectionLimit.toString());
  }
  
  // في بيئة حقيقية، قد ترغب في إعادة تهيئة مجمع الاتصالات هنا
  
  return getDatabaseConfig();
};
