
import React from 'react';

interface PaymentDetailsProps {
  plan: string;
  amount: number;
}

const PaymentDetails = ({ plan, amount }: PaymentDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between py-2 border-b">
        <span className="font-medium">نوع الباقة:</span>
        <span>{plan}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span className="font-medium">المبلغ:</span>
        <span>{amount} ريال {amount > 0 ? "/ شهرياً" : ""}</span>
      </div>
      <div className="flex justify-between py-2 border-b">
        <span className="font-medium">طريقة الدفع:</span>
        <span>بطاقة ائتمان</span>
      </div>
    </div>
  );
};

export default PaymentDetails;
