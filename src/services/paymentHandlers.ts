
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

// معالجة الدفع عبر PayPal
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
    // إنشاء سجل فاتورة في قاعدة البيانات
    const { data, error } = await supabase.from('payment_invoices').insert([{
      invoice_id: `PP-${Date.now()}`,
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

    // تحديد البيئة (الإنتاج أو الاختبار)
    const paypalDomain = paypalSandbox 
      ? 'https://www.sandbox.paypal.com' 
      : 'https://www.paypal.com';
    
    // إنشاء URL للدفع المباشر باستخدام اسم التاجر
    const returnUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/payment-cancel`;
    
    // إنشاء رابط الدفع مع المعلمات اللازمة
    const paypalPaymentUrl = new URL(`${paypalDomain}/cgi-bin/webscr`);
    paypalPaymentUrl.searchParams.append('cmd', '_xclick');
    
    // بدلاً من استخدام معرف العميل، استخدم البريد الإلكتروني المسجل
    // يكون معرف العميل هو عنوان البريد الإلكتروني الخاص بحساب PayPal
    paypalPaymentUrl.searchParams.append('business', paypalClientId);
    
    paypalPaymentUrl.searchParams.append('item_name', `اشتراك ${plan === 'premium' ? 'مميز' : 'احترافي'}`);
    paypalPaymentUrl.searchParams.append('amount', usdAmount.toString());
    paypalPaymentUrl.searchParams.append('currency_code', 'USD');
    paypalPaymentUrl.searchParams.append('return', returnUrl);
    paypalPaymentUrl.searchParams.append('cancel_return', cancelUrl);
    
    // إضافة معرف الفاتورة لتتبعها
    paypalPaymentUrl.searchParams.append('custom', data?.[0]?.invoice_id || `PP-${Date.now()}`);
    
    // إضافة معلومات إضافية لتجنب الرفض
    paypalPaymentUrl.searchParams.append('no_shipping', '1'); // لا داعي لعنوان الشحن
    paypalPaymentUrl.searchParams.append('no_note', '1'); // لا داعي لملاحظات
    paypalPaymentUrl.searchParams.append('rm', '2'); // إرسال البيانات كمتغيرات POST
    
    // إضافة معلومات المشتري إذا كانت متوفرة
    if (customerInfo.name) {
      const nameParts = customerInfo.name.split(' ');
      paypalPaymentUrl.searchParams.append('first_name', nameParts[0] || '');
      paypalPaymentUrl.searchParams.append('last_name', nameParts.slice(1).join(' ') || '');
    }
    
    if (customerInfo.email) {
      paypalPaymentUrl.searchParams.append('email', customerInfo.email);
    }
    
    console.log("توجيه المستخدم إلى رابط PayPal:", paypalPaymentUrl.toString());
    
    // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayPal
    window.location.href = paypalPaymentUrl.toString();
  } catch (error) {
    console.error("خطأ في عملية الدفع عبر PayPal:", error);
    throw new Error("فشل في بدء عملية الدفع عبر PayPal");
  }
};
