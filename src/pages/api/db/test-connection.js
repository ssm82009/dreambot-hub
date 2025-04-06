
// هذا مجرد نموذج بسيط يعيد حالة الاتصال
// هذا الملف سيعمل فقط في بيئة Next.js أو بيئة مماثلة
export default async function handler(req, res) {
  // في بيئة حقيقية، سنختبر الاتصال بقاعدة بيانات MySQL
  // لكن هنا نعيد استجابة وهمية للاختبار
  
  res.status(200).json({
    success: true,
    message: 'تم الاتصال بقاعدة بيانات MySQL بنجاح (محاكاة)',
    details: {
      host: '173.249.0.2',
      port: 3306,
      user: 'taweel_1',
      database: 'taweel_1'
    }
  });
}
