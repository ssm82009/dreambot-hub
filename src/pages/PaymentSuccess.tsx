
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentSuccessContent from '@/components/payment/PaymentSuccessContent';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';

const PaymentSuccess = () => {
  const { transactionIdentifier } = usePaymentVerification();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <PaymentSuccessContent transactionIdentifier={transactionIdentifier} />
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
