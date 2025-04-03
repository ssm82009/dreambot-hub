
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sarToUsd } from '@/utils/currency';

/**
 * معالجة الدفع عبر PayPal
 * @param customerInfo معلومات العميل
 * @param userId معرف المستخدم
 * @param amount المبلغ بالريال السعودي
 * @param plan نوع الباقة
 * @param paypalClientId معرف العميل لـ PayPal
 * @param paypalSandbox تفعيل وضع الاختبار
 */
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
