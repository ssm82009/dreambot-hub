
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentHeader from '@/components/payment/PaymentHeader';
import PaymentCard from '@/components/payment/PaymentCard';
import { toast } from "sonner";
import { createPaylinkInvoice } from '@/services/paylinkService';
import { supabase } from "@/integrations/supabase/client";
import { sarToUsd, formatCurrency } from '@/utils/currency';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paylinkApiKey, setPaylinkApiKey] = useState<string>('');
  const [paylinkSecretKey, setPaylinkSecretKey] = useState<string>('');
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [paypalSandbox, setPaypalSandbox] = useState<boolean>(false);

  useEffect(() => {
    // التحقق من أن المستخدم وصل للصفحة عن طريق صفحة الأسعار
    if (!location.state || !location.state.plan || !location.state.price) {
      navigate('/pricing');
      return;
    }

    // تعيين الخطة والمبلغ بناءً على البيانات المرسلة من صفحة الأسعار
    const selectedPlan = location.state.plan;
    const selectedPrice = location.state.price;
    
    setPlan(selectedPlan);
    setAmount(selectedPrice);
    
    console.log(`تم اختيار الباقة: ${selectedPlan} بسعر: ${selectedPrice} ريال`);
    
    // استرجاع إعدادات الدفع من النظام
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

        if (data) {
          // إعدادات PayLink
          if (data.paylink_enabled) {
            if (data.paylink_api_key && data.paylink_secret_key) {
              setPaylinkApiKey(data.paylink_api_key);
              setPaylinkSecretKey(data.paylink_secret_key);
              console.log("تم تحميل بيانات اعتماد PayLink بنجاح");
            } else {
              console.warn("بيانات اعتماد PayLink غير متوفرة");
            }
          }

          // إعدادات PayPal
          if (data.paypal_enabled) {
            if (data.paypal_client_id) {
              setPaypalClientId(data.paypal_client_id);
              setPaypalSandbox(data.paypal_sandbox);
              console.log("تم تحميل بيانات اعتماد PayPal بنجاح");
            } else {
              console.warn("بيانات اعتماد PayPal غير متوفرة");
            }
          }
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

    setIsProcessing(true);

    try {
      // حفظ الخطة في التخزين المؤقت لاستخدامها عند عودة المستخدم من صفحة الدفع
      localStorage.setItem('pendingSubscriptionPlan', plan);

      // الحصول على معرف المستخدم الحالي
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // معالجة الدفع بناءً على طريقة الدفع المختارة
      if (customerInfo.paymentMethod === 'paylink') {
        await handlePaylinkPayment(customerInfo, userId);
      } else if (customerInfo.paymentMethod === 'paypal') {
        await handlePaypalPayment(customerInfo, userId);
      } else {
        throw new Error("طريقة دفع غير مدعومة");
      }
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء طلب الدفع");
      setIsProcessing(false);
    }
  };

  // معالجة الدفع عبر PayLink
  const handlePaylinkPayment = async (customerInfo: any, userId: string | undefined) => {
    // التحقق من توفر بيانات اعتماد API
    if (!paylinkApiKey || !paylinkSecretKey) {
      throw new Error("لم يتم تكوين بيانات اعتماد PayLink");
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
  const handlePaypalPayment = async (customerInfo: any, userId: string | undefined) => {
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

      // إنشاء رابط الدفع عبر PayPal
      // تحديد البيئة (الإنتاج أو الاختبار)
      const paypalDomain = paypalSandbox 
        ? 'https://www.sandbox.paypal.com' 
        : 'https://www.paypal.com';
      
      // إنشاء URL للدفع المباشر
      const returnUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancel`;
      
      // إنشاء رابط الدفع مع المعلمات اللازمة
      const paypalPaymentUrl = new URL(`${paypalDomain}/cgi-bin/webscr`);
      paypalPaymentUrl.searchParams.append('cmd', '_xclick');
      paypalPaymentUrl.searchParams.append('business', paypalClientId);
      paypalPaymentUrl.searchParams.append('item_name', `اشتراك ${plan === 'premium' ? 'مميز' : 'احترافي'}`);
      paypalPaymentUrl.searchParams.append('amount', usdAmount.toString());
      paypalPaymentUrl.searchParams.append('currency_code', 'USD');
      paypalPaymentUrl.searchParams.append('return', returnUrl);
      paypalPaymentUrl.searchParams.append('cancel_return', cancelUrl);
      paypalPaymentUrl.searchParams.append('custom', data?.[0]?.invoice_id || `PP-${Date.now()}`);
      
      // إضافة معلومات المشتري
      paypalPaymentUrl.searchParams.append('first_name', customerInfo.name.split(' ')[0] || '');
      paypalPaymentUrl.searchParams.append('last_name', customerInfo.name.split(' ').slice(1).join(' ') || '');
      paypalPaymentUrl.searchParams.append('email', customerInfo.email);
      
      console.log("توجيه المستخدم إلى رابط PayPal:", paypalPaymentUrl.toString());
      
      // توجيه المستخدم إلى صفحة الدفع الخاصة بـ PayPal
      window.location.href = paypalPaymentUrl.toString();
    } catch (error) {
      console.error("خطأ في عملية الدفع عبر PayPal:", error);
      throw new Error("فشل في بدء عملية الدفع عبر PayPal");
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
