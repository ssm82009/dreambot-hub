
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentHeader from '@/components/payment/PaymentHeader';
import PaymentCard from '@/components/payment/PaymentCard';
import { toast } from "sonner";
import { createPaylinkInvoice } from '@/services/paylinkService';
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paylinkApiKey, setPaylinkApiKey] = useState<string>('');

  useEffect(() => {
    // التحقق من أن المستخدم وصل للصفحة عن طريق صفحة الأسعار
    if (!location.state || !location.state.plan) {
      navigate('/pricing');
      return;
    }

    // تعيين الخطة والمبلغ بناءً على الباقة المختارة
    const selectedPlan = location.state.plan;
    setPlan(selectedPlan);
    
    let priceAmount = 0;
    switch (selectedPlan) {
      case 'المجاني':
        priceAmount = 0;
        break;
      case 'المميز':
        priceAmount = 49;
        break;
      case 'الاحترافي':
        priceAmount = 99;
        break;
      default:
        priceAmount = 0;
    }
    setAmount(priceAmount);
    
    // استرجاع مفتاح API لـ PayLink من إعدادات النظام
    const fetchPaymentSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.error("خطأ في جلب إعدادات الدفع:", error);
          return;
        }

        if (data && data.paylink_enabled && data.paylink_api_key) {
          setPaylinkApiKey(data.paylink_api_key);
        } else {
          console.warn("لم يتم تكوين إعدادات PayLink بشكل صحيح");
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      }
    };

    fetchPaymentSettings();
  }, [location, navigate]);

  const handlePayment = async (customerInfo: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => {
    // إذا كانت الباقة مجانية، نقوم بتحديث الاشتراك مباشرة
    if (amount === 0) {
      toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
      localStorage.setItem('subscriptionType', plan);
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    // للباقات المدفوعة، نستخدم PayLink
    setIsProcessing(true);

    try {
      // التحقق من توفر مفتاح API
      if (!paylinkApiKey) {
        throw new Error("لم يتم تكوين مفتاح API لـ PayLink");
      }

      // لأغراض الاختبار، استخدم مفتاح الوضع التجريبي الذي يبدأ بـ 'test_'
      const isTestMode = paylinkApiKey.startsWith('test_');
      console.log("Using PayLink in", isTestMode ? "test" : "live", "mode");

      // حفظ الخطة في التخزين المؤقت لاستخدامها عند عودة المستخدم من صفحة الدفع
      localStorage.setItem('pendingSubscriptionPlan', plan);

      // تنظيف وتنسيق رقم الهاتف (إزالة أي أحرف غير رقمية)
      const formattedPhone = customerInfo.phone.replace(/\D/g, '');

      // إنشاء فاتورة في PayLink
      const invoice = await createPaylinkInvoice(
        paylinkApiKey,
        amount,
        plan,
        customerInfo.name,
        customerInfo.email,
        formattedPhone
      );

      if (!invoice || !invoice.payment_url) {
        throw new Error("فشل في إنشاء فاتورة الدفع");
      }

      // حفظ معلومات الفاتورة في قاعدة البيانات (اختياري)
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        // إنشاء سجل فاتورة جديد في جدول payment_invoices
        await supabase.from('payment_invoices').insert([{
          invoice_id: invoice.id,
          user_id: userId,
          plan_name: plan,
          amount: amount,
          status: invoice.status,
          payment_method: 'paylink'
        }]);
      } catch (dbError) {
        // نسجل الخطأ ولكن نستمر في العملية
        console.error("فشل في حفظ بيانات الفاتورة:", dbError);
      }

      // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayLink
      window.location.href = invoice.payment_url;
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء فاتورة الدفع");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PaymentHeader plan={plan} />
          <PaymentCard 
            plan={plan} 
            amount={amount} 
            onPayment={handlePayment} 
            isProcessing={isProcessing}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
