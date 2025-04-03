
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import PaymentMethod from './PaymentMethod';
import { supabase } from "@/integrations/supabase/client";

// تعريف مخطط التحقق من صحة النموذج
const formSchema = z.object({
  name: z.string().min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل" })
});

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
    { id: 'paylink', name: 'PayLink', description: 'بطاقة مدى / فيزا / ماستركارد', enabled: true },
    { id: 'paypal', name: 'PayPal', description: 'الدفع عبر حساب PayPal', enabled: false }
  ]);

  // نموذج البيانات
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  // جلب إعدادات بوابات الدفع
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

          // تعيين طريقة الدفع الافتراضية إلى أول طريقة مفعلة
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

  // مراقبة التغييرات وإرسالها إلى المكون الأب
  useEffect(() => {
    const values = form.getValues();
    onCustomerInfoChange({
      name: values.name,
      email: values.email,
      phone: values.phone,
      paymentMethod
    });
  }, [form.watch(), paymentMethod, onCustomerInfoChange]);

  // عند تغيير طريقة الدفع
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">الاسم الكامل</Label>
                <FormControl>
                  <Input id="name" placeholder="أدخل اسمك الكامل" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <FormControl>
                  <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" dir="ltr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <FormControl>
                  <Input id="phone" type="tel" placeholder="05xxxxxxxx" dir="ltr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
      
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
