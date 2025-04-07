import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentHeader from '@/components/payment/PaymentHeader';
import PaymentCard from '@/components/payment/PaymentCard';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentProcess } from '@/hooks/usePaymentProcess';
import { usePaymentSubmit } from '@/hooks/usePaymentSubmit';

const Payment = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 rtl">
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
