
/**
 * API للتحقق من وجود الجداول المطلوبة في قاعدة بيانات PostgreSQL
 */

export default async function handler(req, res) {
  // التعامل فقط مع طلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // استخراج معلومات الاتصال من الطلب
    const { config } = req.body;

    if (!config || !config.host || !config.user || !config.database) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid configuration. Please provide host, user, and database.' 
      });
    }

    // محاكاة الاستجابة حيث أن هذا مجرد API وهمي للاختبار
    return res.status(200).json({
      success: true,
      message: 'تم التحقق من الجداول بنجاح',
      tables: [
        { name: 'users', exists: true },
        { name: 'dreams', exists: true },
        { name: 'dream_symbols', exists: true },
        { name: 'settings', exists: true }
      ]
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
