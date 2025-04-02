
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface PaymentActionsProps {
  amount: number;
  onPayment: () => void;
  isDisabled?: boolean;
  isProcessing?: boolean;
}

const PaymentActions = ({ 
  amount, 
  onPayment, 
  isDisabled = false,
  isProcessing = false 
}: PaymentActionsProps) => {
  const navigate = useNavigate();
  
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
          amount === 0 ? "اشترك مجانًا" : "إتمام الدفع"
        )}
      </Button>
    </div>
  );
};

export default PaymentActions;
