
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PaymentActionsProps {
  amount: number;
  onPayment: () => void;
}

const PaymentActions = ({ amount, onPayment }: PaymentActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <Button 
        variant="outline" 
        onClick={() => navigate('/pricing')}
        className="w-full sm:w-auto flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        العودة
      </Button>
      <Button 
        onClick={onPayment}
        className="w-full sm:w-auto"
        disabled={amount === 0}
      >
        {amount === 0 ? "اشترك مجانًا" : "إتمام الدفع"}
      </Button>
    </div>
  );
};

export default PaymentActions;
