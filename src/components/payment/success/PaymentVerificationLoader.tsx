
import React from 'react';
import { Loader2 } from 'lucide-react';

const PaymentVerificationLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <h2 className="text-xl font-medium">جاري التحقق من عملية الدفع...</h2>
    </div>
  );
};

export default PaymentVerificationLoader;
