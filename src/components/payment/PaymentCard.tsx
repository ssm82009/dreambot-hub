
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentDetails from './PaymentDetails';
import PaymentForm from './PaymentForm';
import PaymentActions from './PaymentActions';

interface PaymentCardProps {
  plan: string;
  amount: number;
  onPayment: (customerInfo: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => void;
  isProcessing: boolean;
}

const PaymentCard = ({ plan, amount, onPayment, isProcessing }: PaymentCardProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'paylink'
  });

  const handleCustomerInfoChange = (info: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => {
    setCustomerInfo(info);
  };

  const handlePayment = () => {
    onPayment(customerInfo);
  };

  // التحقق من صحة بيانات العميل
  const isFormValid = amount === 0 || (
    customerInfo.name.trim() !== '' && 
    customerInfo.email.trim() !== '' && 
    customerInfo.phone.trim() !== ''
  );

  return (
    <Card className="max-w-2xl mx-auto border-2 border-primary/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">تفاصيل الدفع</CardTitle>
        <CardDescription>يرجى مراجعة تفاصيل اشتراكك قبل المتابعة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentDetails plan={plan} amount={amount} />
        
        {/* إظهار نموذج بيانات الدفع فقط إذا كان المبلغ أكبر من 0 */}
        {amount > 0 && (
          <PaymentForm onCustomerInfoChange={handleCustomerInfoChange} />
        )}
      </CardContent>
      <CardFooter>
        <PaymentActions 
          amount={amount} 
          onPayment={handlePayment} 
          isDisabled={!isFormValid || isProcessing}
          isProcessing={isProcessing}
        />
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
