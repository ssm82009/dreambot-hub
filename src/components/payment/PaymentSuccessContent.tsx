
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface PaymentSuccessContentProps {
  transactionIdentifier: string;
}

const PaymentSuccessContent = ({ transactionIdentifier }: PaymentSuccessContentProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500 text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-green-600">تمت عملية الدفع بنجاح!</h1>
        <p className="mb-6 text-gray-600">
          شكراً لاشتراكك معنا. تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع مميزات الباقة.
        </p>
        {transactionIdentifier && (
          <p className="mb-6 text-sm text-gray-500">
            رقم العملية: {transactionIdentifier}
          </p>
        )}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => navigate('/profile')}
          >
            الذهاب للملف الشخصي
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessContent;
