
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { PricingSettingsFormValues } from '@/contexts/admin/types';

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
              {...form.register("freePlanName")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              value="0" 
              readOnly 
              {...form.register("freePlanPrice", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("freePlanInterpretations", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={3}
              {...form.register("freePlanFeatures")}
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
              {...form.register("premiumPlanName")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              {...form.register("premiumPlanPrice", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("premiumPlanInterpretations", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">القيمة المثبتة في النظام هي 19 تفسير للباقة المميزة</p>
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={5}
              {...form.register("premiumPlanFeatures")}
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
              {...form.register("proPlanName")}
            />
          </div>
          <div className="space-y-2">
            <Label>السعر (ريال)</Label>
            <Input 
              type="number" 
              {...form.register("proPlanPrice", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label>عدد التفسيرات الشهرية</Label>
            <Input 
              type="number" 
              {...form.register("proPlanInterpretations", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">القيمة المثبتة في النظام هي 30 تفسير للباقة الاحترافية</p>
          </div>
          <div className="space-y-2">
            <Label>المميزات</Label>
            <Textarea 
              placeholder="أدخل المميزات هنا..."
              rows={5}
              {...form.register("proPlanFeatures")}
            />
          </div>
        </div>
      </div>
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default PricingSettingsForm;
