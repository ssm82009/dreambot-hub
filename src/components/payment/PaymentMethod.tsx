
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard } from 'lucide-react';

export interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  availableMethods: PaymentMethodOption[];
}

const PaymentMethod = ({ selectedMethod, onMethodChange, availableMethods }: PaymentMethodProps) => {
  // Filter only enabled payment methods
  const enabledMethods = availableMethods.filter(method => method.enabled);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 flex-row-reverse">
        <CreditCard className="h-5 w-5" />
        <h3 className="font-medium">اختر طريقة الدفع</h3>
      </div>
      
      {enabledMethods.length > 0 ? (
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={onMethodChange}
          className="flex flex-col space-y-3"
        >
          {enabledMethods.map(method => (
            <div key={method.id} className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex items-center gap-2">
                <div className={`flex items-center justify-center ${method.id === 'paylink' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'} font-bold rounded px-2 py-1 text-xs`}>
                  {method.name}
                </div>
                <span>{method.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
          <p className="text-amber-800 text-sm">لم يتم تكوين أي طرق دفع. يرجى الاتصال بالمسؤول.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
