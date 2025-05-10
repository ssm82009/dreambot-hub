
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sarToUsd } from '@/utils/currency';
import { CustomerInfo } from '@/types/payment';
import { UpdatePaymentSessionData } from '@/types/payment-sessions';

/**
 * معالجة الدفع عبر PayPal باستخدام Checkout API v2
 * @param customerInfo معلومات العميل
 * @param userId معرف المستخدم
 * @param amount المبلغ بالريال السعودي
 * @param plan نوع الباقة
 * @param paypalClientId معرف العميل لـ PayPal
 * @param paypalSandbox تفعيل وضع الاختبار
 * @param paypalSecret المفتاح السري لـ PayPal
 * @param sessionId معرف جلسة الدفع
 */
export const handlePaypalPayment = async (
  customerInfo: CustomerInfo, 
  userId: string | undefined, 
  amount: number,
  plan: string,
  paypalClientId: string,
  paypalSandbox: boolean,
  paypalSecret: string,
  sessionId: string
) => {
  // التحقق من توفر بيانات اعتماد PayPal
  if (!paypalClientId || !paypalSecret) {
    throw new Error("لم يتم تكوين بيانات اعتماد PayPal");
  }

  // تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي
  const usdAmount = sarToUsd(amount);
  console.log(`تحويل ${amount} ريال سعودي إلى ${usdAmount} دولار أمريكي`);

  try {
    // إنشاء معرف فريد للفاتورة (نستخدم معرف الجلسة)
    const invoiceId = sessionId;
    console.log("Creating PayPal payment with session ID:", invoiceId);
    
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

    // تحديد بيئة PayPal (الإنتاج أو الاختبار)
    const paypalApiUrl = paypalSandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';

    // الحصول على Access Token من PayPal
    console.log("Getting PayPal access token...");
    const authResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.text();
      console.error("PayPal auth error:", errorData);
      throw new Error("فشل في الحصول على توكن PayPal");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    console.log("Received PayPal access token");

    // إنشاء طلب الدفع في PayPal
    console.log("Creating PayPal order...");
    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: usdAmount.toString()
          },
          description: `اشتراك ${plan === 'premium' ? 'مميز' : 'احترافي'}`,
          custom_id: invoiceId
        }],
        application_context: {
          return_url: `${window.location.origin}/payment/success?session_id=${invoiceId}`,
          cancel_url: `${window.location.origin}/payment/cancel?session_id=${invoiceId}`,
          brand_name: 'تفسير الأحلام',
          locale: 'ar-SA',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING'
        }
      })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("PayPal order creation error:", errorData);
      throw new Error("فشل في إنشاء طلب PayPal");
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created:", orderData);

    // تحديث معرف المعاملة في سجل الفاتورة
    if (orderData.id) {
      await supabase.from('payment_invoices')
        .update({
          invoice_id: orderData.id
        })
        .eq('invoice_id', sessionId);
    }

    // الحصول على رابط الدفع وإعادة توجيه المستخدم
    const approvalUrl = orderData.links.find((link: any) => link.rel === 'approve')?.href;
    if (!approvalUrl) {
      console.error("No approval URL found in PayPal response:", orderData);
      throw new Error("لم يتم العثور على رابط موافقة PayPal");
    }

    console.log("Redirecting user to PayPal approval URL:", approvalUrl);
    window.location.href = approvalUrl;
  } catch (error) {
    console.error("خطأ في عملية الدفع عبر PayPal:", error);
    toast.error("فشل في بدء عملية الدفع عبر PayPal");
    throw new Error("فشل في بدء عملية الدفع عبر PayPal");
  }
};
