
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { PaymentSettings } from '@/types/database';

type PaymentSettingsFormValues = {
  paylink: {
    enabled: boolean;
    apiKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    secret: string;
    sandbox: boolean;
  };
};

type PaymentSettingsFormProps = {
  initialData: PaymentSettingsFormValues;
  onSubmit: (data: PaymentSettingsFormValues) => Promise<void>;
};

const PaymentSettingsForm: React.FC<PaymentSettingsFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<PaymentSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">PayLink.sa</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>تفعيل PayLink.sa</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="enable-paylink" 
                checked={form.watch("paylink.enabled")}
                onCheckedChange={(checked) => 
                  form.setValue("paylink.enabled", checked as boolean)
                }
              />
              <label htmlFor="enable-paylink" className="text-sm">تفعيل</label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>مفتاح API</Label>
            <Input 
              placeholder="أدخل مفتاح API لـ PayLink.sa" 
              dir="ltr" 
              {...form.register("paylink.apiKey")}
            />
          </div>
          <div className="space-y-2">
            <Label>المفتاح السري</Label>
            <Input 
              placeholder="أدخل المفتاح السري لـ PayLink.sa" 
              dir="ltr" 
              type="password" 
              {...form.register("paylink.secretKey")}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">PayPal</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>تفعيل PayPal</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="enable-paypal" 
                checked={form.watch("paypal.enabled")}
                onCheckedChange={(checked) => 
                  form.setValue("paypal.enabled", checked as boolean)
                }
              />
              <label htmlFor="enable-paypal" className="text-sm">تفعيل</label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>معرف العميل</Label>
            <Input 
              placeholder="أدخل معرف العميل لـ PayPal" 
              dir="ltr" 
              {...form.register("paypal.clientId")}
            />
          </div>
          <div className="space-y-2">
            <Label>السر</Label>
            <Input 
              placeholder="أدخل السر لـ PayPal" 
              dir="ltr" 
              type="password" 
              {...form.register("paypal.secret")}
            />
          </div>
          <div className="space-y-2">
            <Label>وضع الاختبار</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox 
                id="paypal-sandbox" 
                checked={form.watch("paypal.sandbox")}
                onCheckedChange={(checked) => 
                  form.setValue("paypal.sandbox", checked as boolean)
                }
              />
              <label htmlFor="paypal-sandbox" className="text-sm">تفعيل وضع الاختبار</label>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mt-2">
            <p className="text-sm text-yellow-800">
              <strong>ملاحظة:</strong> عند استخدام PayPal سيتم تحويل المبلغ من الريال السعودي إلى الدولار الأمريكي بسعر الصرف الحالي.
            </p>
          </div>
        </div>
      </div>
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default PaymentSettingsForm;
