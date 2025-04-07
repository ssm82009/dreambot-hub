
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingHeader from '@/components/pricing/PricingHeader';
import PricingPlans from '@/components/pricing/PricingPlans';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true' || 
                        localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
  }, []);

  const handleSubscription = (plan: string, price: number) => {
    if (!isLoggedIn) {
      // إذا لم يكن المستخدم مسجل الدخول، توجيهه إلى صفحة التسجيل
      toast.info("يجب تسجيل الدخول أولاً للاشتراك");
      navigate('/register');
    } else {
      // إذا كان المستخدم مسجل الدخول، توجيهه مباشرة إلى صفحة الدفع
      toast.info(`سيتم توجيهك إلى صفحة الدفع للاشتراك في باقة ${plan}`);
      navigate('/payment', { state: { plan, price } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PricingHeader />
          <PricingPlans onSubscribe={handleSubscription} />
          <PricingFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
