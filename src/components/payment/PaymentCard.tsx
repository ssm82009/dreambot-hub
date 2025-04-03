
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentDetails from './PaymentDetails';
import PaymentForm from './PaymentForm';
import PaymentActions from './PaymentActions';
import PaymentMethod from './PaymentMethod';
import { CustomerInfo } from '@/types/payment';

interface PaymentCardProps {
  plan: string;
  amount: number;
  onPayment: (customerInfo: CustomerInfo) => void;
  isProcessing: boolean;
}

const PaymentCard = ({ plan, amount, onPayment, isProcessing }: PaymentCardProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'paylink'
  });

  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const handlePaymentMethodChange = (method: string) => {
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      paymentMethod: method
    }));
  };

  const handlePayment = () => {
    onPayment(customerInfo);
  };

  // التحقق من صحة بيانات العميل
  const isFormValid = 
    amount === 0 || 
    customerInfo.paymentMethod === 'paypal' || 
    (customerInfo.name.trim() !== '' && 
     customerInfo.email.trim() !== '' && 
     customerInfo.phone.trim() !== '');

  return (
    <Card className="max-w-2xl mx-auto border-2 border-primary/50 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">تفاصيل الدفع</CardTitle>
        <CardDescription>يرجى مراجعة تفاصيل اشتراكك قبل المتابعة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. نوع الباقة والمبلغ */}
        <PaymentDetails 
          plan={plan} 
          amount={amount} 
        />
        
        {amount > 0 && (
          <>
            {/* 2. اختيار طريقة الدفع */}
            <div className="border-t pt-4">
              <PaymentMethod 
                selectedMethod={customerInfo.paymentMethod} 
                onMethodChange={handlePaymentMethodChange} 
                availableMethods={[
                  { id: 'paylink', name: 'بطاقة بنكية', description: 'بطاقة الدفع الإلكتروني (مدى، فيزا، ماستركارد، أبل باي، stcPay)', enabled: true },
                  { id: 'paypal', name: 'PayPal', description: 'الدفع عبر حساب PayPal', enabled: true }
                ]}
              />
            </div>
            
            {/* 3. ادخال بيانات العميل - فقط إذا كانت طريقة الدفع هي بطاقة */}
            {customerInfo.paymentMethod === 'paylink' && (
              <div className="border-t pt-4">
                <PaymentForm onCustomerInfoChange={handleCustomerInfoChange} />
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {/* 4. زر العودة أو اتمام الدفع */}
        <PaymentActions 
          amount={amount} 
          onPayment={handlePayment} 
          isDisabled={!isFormValid || isProcessing}
          isProcessing={isProcessing}
          paymentMethod={customerInfo.paymentMethod}
        />
      </CardFooter>
    </Card>
  );
};

export default PaymentCard;
