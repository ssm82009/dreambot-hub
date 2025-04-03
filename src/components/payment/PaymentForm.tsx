
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  // Initialize form with validation schema
  const form = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  // Monitor changes and send to parent component
  useEffect(() => {
    const values = form.getValues();
    onCustomerInfoChange({
      name: values.name,
      email: values.email,
      phone: values.phone,
      paymentMethod: 'paylink' // This will be overridden by the parent component
    });
  }, [form.watch(), onCustomerInfoChange]);

  return (
    <div className="space-y-6">
      <h3 className="font-medium mb-4">بيانات العميل</h3>
      <CustomerInfoForm form={form} />
    </div>
  );
};

export default PaymentForm;
