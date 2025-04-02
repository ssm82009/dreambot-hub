
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaymentMethod from './PaymentMethod';

interface PaymentFormProps {
  onCustomerInfoChange: (info: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => void;
}

const PaymentForm = ({ onCustomerInfoChange }: PaymentFormProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'paylink'
  });

  const handleInputChange = (field: string, value: string) => {
    const updatedInfo = { ...customerInfo, [field]: value };
    setCustomerInfo(updatedInfo);
    onCustomerInfoChange(updatedInfo);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-4">معلومات العميل</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="customer-name">الاسم الكامل</Label>
            <Input 
              id="customer-name"
              type="text" 
              placeholder="أدخل اسمك الكامل" 
              className="border rounded-md p-2 w-full bg-background"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="customer-email">البريد الإلكتروني</Label>
            <Input 
              id="customer-email"
              type="email" 
              placeholder="example@domain.com" 
              className="border rounded-md p-2 w-full bg-background"
              dir="ltr"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="customer-phone">رقم الجوال</Label>
            <Input 
              id="customer-phone"
              type="tel" 
              placeholder="05xxxxxxxx" 
              className="border rounded-md p-2 w-full bg-background"
              dir="ltr"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      
      <PaymentMethod 
        selectedMethod={customerInfo.paymentMethod}
        onMethodChange={(method) => handleInputChange('paymentMethod', method)}
      />
    </div>
  );
};

export default PaymentForm;
