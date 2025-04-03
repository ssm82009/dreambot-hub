
import React from 'react';
import { formatCurrency } from '@/utils/currency';

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
        <span>{formatCurrency(amount, 'SAR')} {amount > 0 ? "/ شهرياً" : ""}</span>
      </div>
    </div>
  );
};

export default PaymentDetails;
