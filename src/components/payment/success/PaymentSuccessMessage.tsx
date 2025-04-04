
import React from 'react';

interface PaymentSuccessMessageProps {
  planName: string;
}

const PaymentSuccessMessage = ({ planName }: PaymentSuccessMessageProps) => {
  return (
    <p className="mb-6 text-gray-600">
      شكراً لاشتراكك معنا. تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع مميزات الباقة
      {planName && ` "${planName}"`}.
    </p>
  );
};

export default PaymentSuccessMessage;
