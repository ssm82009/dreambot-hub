
import React from 'react';
import PaymentStatusBadge from '@/components/admin/transaction/PaymentStatusBadge';

interface PaymentData {
  invoice_id: string;
  amount: number;
  status: string;
}

interface PaymentDetailsCardProps {
  paymentData: PaymentData | null;
  planName: string;
  normalizedStatus: string;
}

const PaymentDetailsCard = ({ paymentData, planName, normalizedStatus }: PaymentDetailsCardProps) => {
  if (!paymentData) return null;

  return (
    <div className="mb-6 border rounded-md p-4 bg-gray-50">
      <div className="text-sm text-right">
        <div className="flex justify-between my-1">
          <span className="font-medium">رقم العملية:</span>
          <span>{paymentData.invoice_id}</span>
        </div>
        <div className="flex justify-between my-1">
          <span className="font-medium">الباقة:</span>
          <span>{planName}</span>
        </div>
        <div className="flex justify-between my-1">
          <span className="font-medium">المبلغ:</span>
          <span>{paymentData.amount} ريال</span>
        </div>
        <div className="flex justify-between my-1">
          <span className="font-medium">الحالة:</span>
          <PaymentStatusBadge status={normalizedStatus} />
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsCard;
