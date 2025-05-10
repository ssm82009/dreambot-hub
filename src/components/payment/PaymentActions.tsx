
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface PaymentActionsProps {
  amount: number;
  onPayment: () => void;
  isDisabled?: boolean;
  isProcessing?: boolean;
  paymentMethod?: string;
}

const PaymentActions = ({ 
  amount, 
  onPayment, 
  isDisabled = false,
  isProcessing = false,
  paymentMethod = 'paylink'
}: PaymentActionsProps) => {
  const navigate = useNavigate();
  
  const paymentButtonText = () => {
    if (amount === 0) return "اشترك مجانًا";
    return paymentMethod === 'paypal' ? "الدفع عبر PayPal" : "إتمام الدفع";
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
      <Button 
        variant="outline" 
        onClick={() => navigate('/pricing')}
        className="w-full sm:w-auto flex items-center gap-2"
        disabled={isProcessing}
      >
        <ArrowLeft className="h-4 w-4" />
        العودة
      </Button>
      <Button 
        onClick={onPayment}
        className="w-full sm:w-auto"
        disabled={isDisabled || amount === 0 && isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري المعالجة...
          </>
        ) : (
          paymentButtonText()
        )}
      </Button>
    </div>
  );
};

export default PaymentActions;
