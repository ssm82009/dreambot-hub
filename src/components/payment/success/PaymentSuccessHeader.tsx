
import React from 'react';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessHeader = () => {
  return (
    <>
      <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-green-600">تمت عملية الدفع بنجاح!</h1>
    </>
  );
};

export default PaymentSuccessHeader;
