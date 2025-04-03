
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import PaymentMethod from './PaymentMethod';
import CustomerInfoForm, { customerInfoSchema, CustomerInfoFormValues } from './CustomerInfoForm';

interface PaymentFormProps {
  onCustomerInfoChange: (info: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }) => void;
}

const PaymentForm = ({ onCustomerInfoChange }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('paylink');
  const [availableMethods, setAvailableMethods] = useState([
    { id: 'paylink', name: 'بطاقة', description: 'بطاقة الدفع الإلكتروني (مدى/فيزا/ماستركارد)', enabled: true },
    { id: 'paypal', name: 'PayPal', description: 'الدفع عبر حساب PayPal', enabled: false }
  ]);

  // Initialize form with validation schema
  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  // Fetch payment gateway settings
  useEffect(() => {
    const fetchPaymentGateways = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('paylink_enabled, paypal_enabled')
          .limit(1)
          .single();

        if (error) {
          console.error("خطأ في جلب إعدادات بوابات الدفع:", error);
          return;
        }

        if (data) {
          setAvailableMethods([
            { id: 'paylink', name: 'PayLink', description: 'بطاقة مدى / فيزا / ماستركارد', enabled: data.paylink_enabled },
            { id: 'paypal', name: 'PayPal', description: 'الدفع عبر حساب PayPal', enabled: data.paypal_enabled }
          ]);

          // Set default payment method to first enabled method
          if (!data.paylink_enabled && data.paypal_enabled) {
            setPaymentMethod('paypal');
          }
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      }
    };

    fetchPaymentGateways();
  }, []);

  // Monitor changes and send to parent component
  useEffect(() => {
    const values = form.getValues();
    onCustomerInfoChange({
      name: values.name,
      email: values.email,
      phone: values.phone,
      paymentMethod
    });
  }, [form.watch(), paymentMethod, onCustomerInfoChange]);

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
    <div className="space-y-6">
      <CustomerInfoForm form={form} />
      
      <div className="border-t pt-4">
        <PaymentMethod 
          selectedMethod={paymentMethod} 
          onMethodChange={handlePaymentMethodChange} 
          availableMethods={availableMethods}
        />
      </div>
    </div>
  );
};

export default PaymentForm;
