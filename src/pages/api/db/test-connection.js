
export default async function handler(req, res) {
  // في بيئة حقيقية، سنختبر الاتصال بقاعدة البيانات MySQL
  // لكن هنا نعيد استجابة وهمية للاختبار
  
  // محاكاة تأخير الاتصال بالخادم
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
