
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { PricingSettings } from '@/types/database';

type PricingSettingsFormValues = {
  freePlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  premiumPlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
  proPlan: {
    name: string;
    price: number;
    interpretationsPerMonth: number;
    features: string;
  };
};

type PricingSettingsFormProps = {
  initialData: PricingSettingsFormValues;
  onSubmit: (data: PricingSettingsFormValues) => Promise<void>;
};

const PricingSettingsForm: React.FC<PricingSettingsFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<PricingSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الخطة المجانية</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>اسم الخطة</Label>
            <Input 
              placeholder="اسم الخطة المجانية"
              {...form.register("freePlan.name")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              value="0" 
              readOnly 
              {...form.register("freePlan.price", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("freePlan.interpretationsPerMonth", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={3}
              {...form.register("freePlan.features")}
            />
            <p className="text-sm text-muted-foreground">أدخل كل ميزة في سطر منفصل</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الخطة المميزة</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>اسم الخطة</Label>
            <Input 
              placeholder="اسم الخطة المميزة"
              {...form.register("premiumPlan.name")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              {...form.register("premiumPlan.price", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("premiumPlan.interpretationsPerMonth", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">استخدم -1 لعدد غير محدود</p>
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={5}
              {...form.register("premiumPlan.features")}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الخطة الاحترافية</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>اسم الخطة</Label>
            <Input 
              placeholder="اسم الخطة الاحترافية"
              {...form.register("proPlan.name")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              {...form.register("proPlan.price", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("proPlan.interpretationsPerMonth", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={5}
              {...form.register("proPlan.features")}
            />
          </div>
        </div>
      </div>
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default PricingSettingsForm;
