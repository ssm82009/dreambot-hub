
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { query, params } = req.body;
  
  // في بيئة حقيقية، سنرسل الاستعلام إلى قاعدة البيانات MySQL
  // لكن هنا نعيد استجابة وهمية للاختبار
  
  res.status(200).json([
    { id: 1, success: true, message: 'تم تنفيذ الاستعلام بنجاح (محاكاة)' }
  ]);
}
