
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
      <div className="flex justify-between py-2 border-b">
        <span className="font-medium">طريقة الدفع:</span>
        <span>بطاقة ائتمان (PayLink)</span>
      </div>

      {amount > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <p>
            <strong>ملاحظة:</strong> سيتم توجيهك إلى صفحة الدفع الآمنة التابعة لـ PayLink لإتمام عملية الدفع.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
