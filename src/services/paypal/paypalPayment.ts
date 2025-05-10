
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sarToUsd } from '@/utils/currency';
import { CustomerInfo } from '@/types/payment';

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
  if (!paypalClientId) {
    throw new Error("لم يتم تكوين معرف العميل لـ PayPal");
  }

  try {
    // إنشاء معرف فريد للفاتورة (نستخدم معرف الجلسة)
    const invoiceId = sessionId;
    console.log("Creating PayPal payment with session ID:", invoiceId);
    
    // تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي
    const usdAmount = sarToUsd(amount);
    console.log(`تحويل ${amount} ريال سعودي إلى ${usdAmount} دولار أمريكي`);
    
    // في هذه النقطة، سيتم التعامل مع الدفع في واجهة المستخدم باستخدام مكون PayPalButton
    // هذه الدالة الآن تقوم فقط بإنشاء سجل الفاتورة وإعداد المعلومات المطلوبة للدفع
    
    // سيتم إدارة عملية الدفع بواسطة مكون PayPalButton وتحديث النتيجة بعد الانتهاء
    
    return {
      sessionId: invoiceId,
      clientId: paypalClientId,
      sandbox: paypalSandbox,
      amount: usdAmount,
      plan: plan
    };
  } catch (error) {
    console.error("خطأ في إعداد عملية الدفع عبر PayPal:", error);
    toast.error("فشل في بدء عملية الدفع عبر PayPal");
    throw new Error("فشل في بدء عملية الدفع عبر PayPal");
  }
};

/**
 * معالجة نتيجة عملية الدفع عبر PayPal
 */
export const handlePaypalApproval = async (
  paymentResult: any,
  userId: string | undefined,
  amount: number,
  plan: string,
  sessionId: string
) => {
  try {
    console.log("Processing PayPal approval:", paymentResult);
    
    if (!userId) {
      throw new Error("لم يتم العثور على معرف المستخدم");
    }
    
    // تحديث حالة الفاتورة بعد إتمام الدفع
    const { error: updateError } = await supabase
      .from('payment_invoices')
      .update({
        status: 'Paid',
        transaction_id: paymentResult.orderId || paymentResult.paymentID,
        payment_details: paymentResult,
        updated_at: new Date().toISOString()
      })
      .eq('invoice_id', sessionId);
      
    if (updateError) {
      console.error("Error updating payment status:", updateError);
      throw new Error("فشل في تحديث حالة الدفع");
    }
    
    // تحديث اشتراك المستخدم
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // اشتراك لمدة 30 يوم
    
    const { error: subscriptionError } = await supabase
      .from('users')
      .update({
        subscription_type: plan,
        subscription_expires_at: expiryDate.toISOString()
      })
      .eq('id', userId);
      
    if (subscriptionError) {
      console.error("Error updating user subscription:", subscriptionError);
      throw new Error("فشل في تحديث اشتراك المستخدم");
    }
    
    // توجيه المستخدم إلى صفحة نجاح الدفع
    window.location.href = `/payment/success?session_id=${sessionId}`;
    
    return true;
  } catch (error) {
    console.error("Error handling PayPal approval:", error);
    toast.error("فشل في معالجة نتيجة الدفع");
    return false;
  }
};
