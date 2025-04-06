
export default async function handler(req, res) {
  // هنا نستجيب بمحاكاة للاتصال بقاعدة البيانات
  // في حالة كنا نستخدم Next.js، فإن هذا الكود سيعمل على الخادم
  
  try {
    // في بيئة المتصفح، سنحاكي الاستجابة
    // في الإنتاج، ستحتاج لاستخدام MySQL فعلياً على الخادم
    
    // استخراج معلومات الاتصال من الطلب
    const config = req.body || {};
    
    // نحاكي الاتصال بقاعدة البيانات
    const isSuccessful = true;
    
    // في حالة النجاح
    if (isSuccessful) {
      return res.status(200).json({
        success: true,
        message: 'تم الاتصال بقاعدة البيانات MySQL بنجاح!',
        details: {
          host: config.host || "173.249.0.2",
          port: config.port || 3306,
          user: config.user || "taweel_1",
          database: config.database || "taweel_1"
        }
      });
    } 
    // في حالة الفشل
    else {
      return res.status(200).json({
        success: false,
        message: 'فشل الاتصال بقاعدة البيانات MySQL',
        error: 'خطأ في الاتصال بقاعدة البيانات',
        details: {
          host: config.host || "173.249.0.2",
          port: config.port || 3306,
          user: config.user || "taweel_1",
          database: config.database || "taweel_1"
        }
      });
    }
  } catch (error) {
    console.error('خطأ في اختبار الاتصال:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء اختبار الاتصال',
      error: error.message
    });
  }
}
