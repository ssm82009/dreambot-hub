
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentHeader from '@/components/payment/PaymentHeader';
import PaymentCard from '@/components/payment/PaymentCard';
import { toast } from "sonner";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

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
  }, [location, navigate]);

  const handlePayment = () => {
    // هنا ستكون الإجراءات الخاصة بعملية الدفع الفعلية (مثل التكامل مع بوابة دفع)
    // حاليًا سنستخدم توست لمحاكاة عملية الدفع
    toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
    
    // تحديث حالة الاشتراك في localStorage (هذا مؤقت، في التطبيق الحقيقي سيكون في قاعدة البيانات)
    localStorage.setItem('subscriptionType', plan);
    
    // التوجيه إلى الصفحة الرئيسية بعد الدفع
    setTimeout(() => {
      navigate('/');
    }, 2000);
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
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
