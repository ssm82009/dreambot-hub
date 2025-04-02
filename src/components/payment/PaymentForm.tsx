
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PaymentForm = () => {
  return (
    <div className="mt-8 space-y-4">
      <div className="bg-muted p-4 rounded-md">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5" />
          <h3 className="font-medium">معلومات بطاقة الدفع</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">هذا نموذج توضيحي فقط. في التطبيق الفعلي سيتم التكامل مع بوابة دفع آمنة.</p>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="card-number" className="text-sm">رقم البطاقة</label>
            <Input 
              id="card-number"
              type="text" 
              placeholder="0000 0000 0000 0000" 
              className="border rounded-md p-2 w-full bg-background"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="expiry" className="text-sm">تاريخ الانتهاء</label>
              <Input 
                id="expiry"
                type="text" 
                placeholder="MM/YY" 
                className="border rounded-md p-2 w-full bg-background"
                maxLength={5}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cvc" className="text-sm">رمز الأمان CVC</label>
              <Input 
                id="cvc"
                type="text" 
                placeholder="123" 
                className="border rounded-md p-2 w-full bg-background"
                maxLength={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
