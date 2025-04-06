
/**
 * إعدادات الاتصال بقاعدة بيانات MySQL
 * يمكنك تعديل هذه الإعدادات حسب بيئة التشغيل الخاصة بك
 */

// إعدادات الاتصال بقاعدة البيانات MySQL
export const mysqlConfig = {
  // عنوان خادم قاعدة البيانات
  host: process.env.DB_HOST || "173.249.0.2",
  // رقم المنفذ لقاعدة البيانات
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  // اسم المستخدم
  user: process.env.DB_USER || "taweel_1",
  // كلمة المرور
  password: process.env.DB_PASSWORD || "TLtyrBxFn3F4Hb4y",
  // اسم قاعدة البيانات
  database: process.env.DB_NAME || "taweel_1",
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
  if (newConfig.host) mysqlConfig.host = newConfig.host;
  if (newConfig.port) mysqlConfig.port = newConfig.port;
  if (newConfig.user) mysqlConfig.user = newConfig.user;
  if (newConfig.database) mysqlConfig.database = newConfig.database;
  if (newConfig.password) mysqlConfig.password = newConfig.password;
  if (newConfig.connectionLimit) mysqlConfig.pool.connectionLimit = newConfig.connectionLimit;
  
  // في بيئة حقيقية، قد ترغب في إعادة تهيئة مجمع الاتصالات هنا
  
  return getDatabaseConfig();
};
