
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createPaylinkInvoice } from '@/services/paylinkService';
import { sarToUsd } from '@/utils/currency';

// معالجة الدفع عبر PayLink
export const handlePaylinkPayment = async (
  customerInfo: any, 
  userId: string | undefined, 
  amount: number,
  plan: string,
  paylinkApiKey: string,
  paylinkSecretKey: string
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

  // حفظ معلومات الفاتورة في قاعدة البيانات
  try {
    // إنشاء سجل فاتورة جديد في جدول payment_invoices
    await supabase.from('payment_invoices').insert([{
      invoice_id: invoice.transactionNo || invoice.orderNumber,
      user_id: userId,
      plan_name: plan,
      amount: amount,
      status: 'Pending',
      payment_method: 'paylink'
    }]);
  } catch (dbError) {
    // نسجل الخطأ ولكن نستمر في العملية
    console.error("فشل في حفظ بيانات الفاتورة:", dbError);
  }

  // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayLink
  window.location.href = paymentUrl;
};

// معالجة الدفع عبر PayPal - استخدام PayPal Checkout API (v2)
export const handlePaypalPayment = async (
  customerInfo: any, 
  userId: string | undefined, 
  amount: number,
  plan: string,
  paypalClientId: string,
  paypalSandbox: boolean
) => {
  // التحقق من توفر بيانات اعتماد PayPal
  if (!paypalClientId) {
    throw new Error("لم يتم تكوين بيانات اعتماد PayPal");
  }

  // تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي
  const usdAmount = sarToUsd(amount);
  console.log(`تحويل ${amount} ريال سعودي إلى ${usdAmount} دولار أمريكي`);

  try {
    // إنشاء معرف فريد للفاتورة
    const invoiceId = `PP-${Date.now()}`;
    console.log("Creating PayPal invoice record with ID:", invoiceId);
    
    // إنشاء سجل فاتورة في قاعدة البيانات قبل توجيه المستخدم إلى PayPal
    const { data, error } = await supabase.from('payment_invoices').insert([{
      invoice_id: invoiceId,
      user_id: userId,
      plan_name: plan,
      amount: amount,
      status: 'Pending',
      payment_method: 'paypal'
    }]).select();

    if (error) {
      console.error("فشل في إنشاء سجل الفاتورة:", error);
      throw new Error("فشل في إنشاء سجل الفاتورة");
    }

    console.log("Invoice record created successfully:", data);

    // تحديد البيئة (الإنتاج أو الاختبار)
    const paypalDomain = paypalSandbox 
      ? 'https://www.sandbox.paypal.com' 
      : 'https://www.paypal.com';
      
    // إعداد عنوان URL للعودة بعد نجاح الدفع - يتضمن معرف الفاتورة
    const returnUrl = `${window.location.origin}/payment/success?custom=${invoiceId}`;
    const cancelUrl = `${window.location.origin}/payment/cancel`;
    
    // بناء رابط PayPal للدفع الفوري باستخدام Hermes flow
    const paypalUrl = new URL(`${paypalDomain}/webapps/hermes`);
    
    // استخدام المعلمات الضرورية للدفع الفوري
    const params = new URLSearchParams({
      'flow': 'purchase',
      'intent': 'capture',
      'currency_code': 'USD', // تأكيد استخدام عملة الدولار
      'amount': usdAmount.toString(), // إرسال المبلغ المحول
      'locale': 'ar_SA',
      'client_id': paypalClientId,
      'return_url': returnUrl,
      'cancel_url': cancelUrl,
      'custom_id': invoiceId,
      'disable-funding': 'credit,card',
      'buyer-country': 'SA'
    });
    
    // إضافة معلومات المنتج والطلب
    params.append('invoice_id', invoiceId);
    
    // بناء الرابط النهائي مع جميع المعلمات
    const finalPaypalUrl = `${paypalUrl.toString()}?${params.toString()}`;
    
    console.log("توجيه المستخدم إلى رابط PayPal:", finalPaypalUrl);
    
    // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayPal
    window.location.href = finalPaypalUrl;
  } catch (error) {
    console.error("خطأ في عملية الدفع عبر PayPal:", error);
    toast.error("فشل في بدء عملية الدفع عبر PayPal");
    throw new Error("فشل في بدء عملية الدفع عبر PayPal");
  }
};
