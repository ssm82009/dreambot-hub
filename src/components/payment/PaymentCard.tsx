
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentDetails from './PaymentDetails';
import PaymentForm from './PaymentForm';
import PaymentActions from './PaymentActions';

interface PaymentCardProps {
  plan: string;
  amount: number;
  onPayment: () => void;
}

const PaymentCard = ({ plan, amount, onPayment }: PaymentCardProps) => {
  return (
    <Card className="max-w-2xl mx-auto border-2 border-primary/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">تفاصيل الدفع</CardTitle>
        <CardDescription>يرجى مراجعة تفاصيل اشتراكك قبل المتابعة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentDetails plan={plan} amount={amount} />
        
        {/* إظهار نموذج بيانات الدفع فقط إذا كان المبلغ أكبر من 0 */}
        {amount > 0 && <PaymentForm />}
      </CardContent>
      <CardFooter>
        <PaymentActions amount={amount} onPayment={onPayment} />
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
