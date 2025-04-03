
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createPaylinkInvoice } from '@/services/paylinkService';

/**
 * معالجة الدفع عبر PayLink
 * @param customerInfo معلومات العميل
 * @param userId معرف المستخدم
 * @param amount المبلغ
 * @param plan نوع الباقة
 * @param paylinkApiKey مفتاح API
 * @param paylinkSecretKey المفتاح السري
 * @param sessionId معرف جلسة الدفع
 */
export const handlePaylinkPayment = async (
  customerInfo: any, 
  userId: string | undefined, 
  amount: number,
  plan: string,
  paylinkApiKey: string,
  paylinkSecretKey: string,
  sessionId: string
) => {
  // التحقق من توفر بيانات اعتماد API
  if (!paylinkApiKey || !paylinkSecretKey) {
    throw new Error("لم يتم تكوين بيانات اعتماد PayLink");
  }

  // التحقق من توفر بيانات العميل
  if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    throw new Error("يرجى إدخال جميع بيانات العميل المطلوبة");
  }

  // لأغراض الاختبار، استخدم مفتاح الوضع التجريبي الذي يبدأ بـ 'test_'
  const isTestMode = paylinkApiKey.toLowerCase().startsWith('test_');
  console.log("Using PayLink in", isTestMode ? "test" : "production", "mode");

  // تنظيف وتنسيق رقم الهاتف (إزالة أي أحرف غير رقمية)
  const formattedPhone = customerInfo.phone.replace(/\D/g, '');

  // إنشاء فاتورة في PayLink
  const invoice = await createPaylinkInvoice(
    paylinkApiKey,
    paylinkSecretKey,
    amount,
    plan,
    customerInfo.name,
    customerInfo.email,
    formattedPhone
  );

  if (!invoice || (!invoice.payment_url && !invoice.url)) {
    throw new Error("فشل في إنشاء فاتورة الدفع");
  }

  // الحصول على رابط الدفع (دعم كلا التنسيقين)
  const paymentUrl = invoice.payment_url || invoice.url;

  // تحديث جلسة الدفع بمعرف المعاملة في PayLink
  try {
    const transactionIdentifier = invoice.transactionNo || invoice.orderNumber;
    
    // تحديث معرف المعاملة في جلسة الدفع
    await supabase.from('payment_sessions')
      .update({
        transaction_identifier: transactionIdentifier
      })
      .eq('session_id', sessionId);

    // إنشاء سجل فاتورة جديد في جدول payment_invoices
    await supabase.from('payment_invoices').insert([{
      invoice_id: transactionIdentifier,
      user_id: userId,
      plan_name: plan,
      amount: amount,
      status: 'Pending',
      payment_method: 'paylink'
    }]);
  } catch (dbError) {
    // نسجل الخطأ ولكن نستمر في العملية
    console.error("فشل في تحديث بيانات المعاملة:", dbError);
  }

  // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayLink
  window.location.href = paymentUrl;
};
