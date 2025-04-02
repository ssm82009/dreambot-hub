
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard } from 'lucide-react';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethod = ({ selectedMethod, onMethodChange }: PaymentMethodProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5" />
        <h3 className="font-medium">اختر طريقة الدفع</h3>
      </div>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={onMethodChange}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-2 space-x-reverse">
          <RadioGroupItem value="paylink" id="paylink" />
          <Label htmlFor="paylink" className="flex items-center gap-2">
            <img src="/paylink-logo.png" alt="PayLink" className="h-6 w-auto" onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://paylink.sa/wp-content/uploads/2021/03/Group-383-1.png';
            }} />
            <span>بطاقة مدى / فيزا / ماستركارد (PayLink)</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethod;
