
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handlePaylinkPayment, handlePaypalPayment } from '@/services/paymentHandlers';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
}

export function usePaymentSubmit(
  plan: string,
  amount: number,
  paylinkApiKey: string,
  paylinkSecretKey: string,
  paypalClientId: string,
  paypalSandbox: boolean,
  setIsProcessing: (isProcessing: boolean) => void
) {
  const navigate = useNavigate();

  const handlePayment = async (customerInfo: CustomerInfo) => {
    // إذا كانت الباقة مجانية، نقوم بتحديث الاشتراك مباشرة
    if (amount === 0) {
      toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
      localStorage.setItem('subscriptionType', plan);
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    setIsProcessing(true);

    try {
      // حفظ الخطة في التخزين المؤقت لاستخدامها عند عودة المستخدم من صفحة الدفع
      localStorage.setItem('pendingSubscriptionPlan', plan);

      // الحصول على معرف المستخدم الحالي
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // معالجة الدفع بناءً على طريقة الدفع المختارة
      if (customerInfo.paymentMethod === 'paylink') {
        await handlePaylinkPayment(
          customerInfo, 
          userId, 
          amount, 
          plan, 
          paylinkApiKey, 
          paylinkSecretKey
        );
      } else if (customerInfo.paymentMethod === 'paypal') {
        await handlePaypalPayment(
          customerInfo, 
          userId, 
          amount, 
          plan, 
          paypalClientId, 
          paypalSandbox
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
