
export default async function handler(req, res) {
  // في بيئة حقيقية، سنتحقق من وجود الجداول المطلوبة
  // لكن هنا نعيد استجابة وهمية للاختبار
  
  res.status(200).json({
    success: true,
    tablesExist: {
      users: true,
      dreams: true,
      dream_symbols: true,
      settings: true
    }
  });
}
