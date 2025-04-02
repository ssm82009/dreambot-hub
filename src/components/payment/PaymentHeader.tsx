
import React from 'react';

interface PaymentHeaderProps {
  plan: string;
}

const PaymentHeader = ({ plan }: PaymentHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold mb-4 gradient-text">إتمام عملية الدفع</h1>
      <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
        أنت على وشك الاشتراك في الباقة {plan}
      </p>
    </div>
  );
};

export default PaymentHeader;
