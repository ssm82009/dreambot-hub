
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
    const invoiceId = `PP-${Date.now()}`;
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

    // تحديد البيئة (الإنتاج أو الاختبار)
    const paypalDomain = paypalSandbox 
      ? 'https://www.sandbox.paypal.com' 
      : 'https://www.paypal.com';
    
    // إنشاء URL للدفع المباشر
    const returnUrl = `${window.location.origin}/payment-success?invoice_id=${invoiceId}`;
    const cancelUrl = `${window.location.origin}/payment-cancel`;
    
    // إنشاء رابط الدفع باستخدام طريقة الدفع المباشر (checkout/payment)
    const paypalPaymentUrl = new URL(`${paypalDomain}/checkoutnow`);
    
    // Adding essential PayPal parameters
    const params = {
      token: invoiceId,
      useraction: 'commit',
      cmd: '_xclick',
      business: paypalClientId,
      item_name: `اشتراك ${plan === 'premium' ? 'مميز' : 'احترافي'}`,
      amount: usdAmount.toString(),
      currency_code: 'USD',
      return: returnUrl,
      cancel_return: cancelUrl,
      custom: invoiceId,
      no_shipping: '1',
      no_note: '1',
      rm: '2'
    };
    
    // Adding buyer info if available
    if (customerInfo.name) {
      const nameParts = customerInfo.name.split(' ');
      params['first_name'] = nameParts[0] || '';
      params['last_name'] = nameParts.slice(1).join(' ') || '';
    }
    
    if (customerInfo.email) {
      params['email'] = customerInfo.email;
    }
    
    // Build the complete URL with all parameters
    const urlParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      urlParams.append(key, value as string);
    }
    
    // Alternative approach using PayPal hosted button
    const hostedPaymentUrl = `${paypalDomain}/cgi-bin/webscr?${urlParams.toString()}`;
    
    console.log("توجيه المستخدم إلى رابط PayPal:", hostedPaymentUrl);
    
    // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayPal
    window.location.href = hostedPaymentUrl;
  } catch (error) {
    console.error("خطأ في عملية الدفع عبر PayPal:", error);
    throw new Error("فشل في بدء عملية الدفع عبر PayPal");
  }
};
