
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handlePaylinkPayment, handlePaypalPayment } from '@/services/paymentHandlers';
import { CustomerInfo } from '@/types/payment';

export function usePaymentSubmit(
  plan: string,
  amount: number,
  paylinkApiKey: string,
  paylinkSecretKey: string,
  paypalClientId: string,
  paypalSandbox: boolean,
  paypalSecret: string,
  setIsProcessing: (isProcessing: boolean) => void
) {
  const navigate = useNavigate();

  const createPaymentSession = async (paymentMethod: string): Promise<string | null> => {
    try {
      // الحصول على معرف المستخدم الحالي
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("خطأ في الحصول على معلومات المستخدم:", userError);
        return null;
      }
      
      const userId = userData.user.id;
      
      // إنشاء معرف جلسة فريد
      const sessionId = `${paymentMethod.toUpperCase()}-${Date.now()}`;
      
      // تخزين معلومات جلسة الدفع في قاعدة البيانات
      const { data: session, error: sessionError } = await supabase
        .from('payment_sessions')
        .insert({
          user_id: userId,
          plan_type: plan,
          amount: amount,
          payment_method: paymentMethod,
          session_id: sessionId,
          status: 'pending'
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error("خطأ في إنشاء جلسة الدفع:", sessionError);
        return null;
      }
      
      console.log("تم إنشاء جلسة دفع جديدة:", sessionId);
      return sessionId;
    } catch (error) {
      console.error("خطأ في إنشاء جلسة الدفع:", error);
      return null;
    }
  };

  const handlePayment = async (customerInfo: CustomerInfo) => {
    // إذا كانت الباقة مجانية، نقوم بتحديث الاشتراك مباشرة
    if (amount === 0) {
      toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
      navigate('/');
      return;
    }

    setIsProcessing(true);

    try {
      // إنشاء جلسة دفع جديدة في قاعدة البيانات
      const sessionId = await createPaymentSession(customerInfo.paymentMethod);
      
      if (!sessionId) {
        throw new Error("فشل في إنشاء جلسة الدفع");
      }

      // الحصول على معرف المستخدم الحالي
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // معالجة الدفع بناءً على طريقة الدفع المختارة
      if (customerInfo.paymentMethod === 'paylink') {
        // للدفع عبر PayLink، نحتاج التحقق من إدخال بيانات العميل
        if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.phone.trim()) {
          setIsProcessing(false);
          toast.error("يرجى إدخال جميع بيانات العميل المطلوبة");
          return;
        }
        
        await handlePaylinkPayment(
          customerInfo, 
          userId, 
          amount, 
          plan, 
          paylinkApiKey, 
          paylinkSecretKey,
          sessionId
        );
      } else if (customerInfo.paymentMethod === 'paypal') {
        // للدفع عبر PayPal، بيانات العميل اختيارية
        await handlePaypalPayment(
          customerInfo, 
          userId, 
          amount, 
          plan, 
          paypalClientId,
          paypalSandbox,
          paypalSecret,
          sessionId
        );
      } else {
        throw new Error("طريقة دفع غير مدعومة");
      }
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء طلب الدفع");
      setIsProcessing(false);
    }
  };

  return { handlePayment };
}
