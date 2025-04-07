
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentHeader from '@/components/payment/PaymentHeader';
import PaymentCard from '@/components/payment/PaymentCard';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentProcess } from '@/hooks/usePaymentProcess';
import { usePaymentSubmit } from '@/hooks/usePaymentSubmit';

const Payment = () => {
  const location = useLocation();
  
  // استخدام Hooks المخصصة للدفع
  const { plan, amount } = usePaymentData();
  const { 
    isProcessing, 
    setIsProcessing, 
    paylinkApiKey, 
    paylinkSecretKey,
    paypalClientId,
    paypalSandbox,
    paypalSecret
  } = usePaymentProcess();
  
  const { handlePayment } = usePaymentSubmit(
    plan,
    amount,
    paylinkApiKey,
    paylinkSecretKey,
    paypalClientId,
    paypalSandbox,
    paypalSecret,
    setIsProcessing
  );
  
  // إعادة تعيين موضع التمرير للأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
