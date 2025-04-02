
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
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

  const handleSubscription = (plan: string) => {
    if (!isLoggedIn) {
      // إذا لم يكن المستخدم مسجل الدخول، توجيهه إلى صفحة التسجيل
      navigate('/register');
    } else {
      // إذا كان المستخدم مسجل الدخول، توجيهه مباشرة إلى صفحة الدفع
      navigate('/payment', { state: { plan } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
