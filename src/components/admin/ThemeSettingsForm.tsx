
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { ThemeSettings } from '@/types/database';

type ThemeSettingsFormValues = {
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  backgroundColor: string;
  logoText: string;
  logoFontSize: number;
  headerColor: string;
  footerColor: string;
  footerText: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
};

type ThemeSettingsFormProps = {
  initialData: ThemeSettingsFormValues;
  onSubmit: (data: ThemeSettingsFormValues) => Promise<void>;
};

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({ initialData, onSubmit }) => {
  const form = useForm<ThemeSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الألوان الرئيسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>اللون الرئيسي</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("primaryColor")}
                onChange={(e) => form.setValue("primaryColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("primaryColor")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>لون الأزرار</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("buttonColor")}
                onChange={(e) => form.setValue("buttonColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("buttonColor")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>لون النص</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("textColor")}
                onChange={(e) => form.setValue("textColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("textColor")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>لون الخلفية</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("backgroundColor")}
                onChange={(e) => form.setValue("backgroundColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("backgroundColor")}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الشعار</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>صورة الشعار</Label>
            <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md">
              <div className="text-center">
                <div className="mt-4 flex flex-col sm:flex-row text-sm leading-6 text-muted-foreground justify-center">
                  <label htmlFor="logo-upload" className="relative cursor-pointer bg-background rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary">
                    <span>تحميل ملف</span>
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" />
                  </label>
                  <p className="sm:pr-1 mt-1 sm:mt-0">أو اسحب وأفلت</p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, SVG حتى 2MB</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>نص الشعار</Label>
            <Input 
              placeholder="تفسير الأحلام" 
              {...form.register("logoText")}
            />
          </div>
          <div className="space-y-2">
            <Label>حجم خط الشعار</Label>
            <Input 
              type="number" 
              {...form.register("logoFontSize", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground">الحجم بوحدة البكسل</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-3">الهيدر والفوتر</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>لون خلفية الهيدر</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("headerColor")}
                onChange={(e) => form.setValue("headerColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("headerColor")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>لون خلفية الفوتر</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                className="w-12 h-10 p-1" 
                {...form.register("footerColor")}
                onChange={(e) => form.setValue("footerColor", e.target.value)}
              />
              <Input 
                className="flex-1" 
                dir="ltr" 
                {...form.register("footerColor")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>نص الفوتر</Label>
            <Input 
              placeholder="جميع الحقوق محفوظة ©" 
              {...form.register("footerText")}
            />
          </div>
          <div className="space-y-2">
            <Label>روابط التواصل الاجتماعي</Label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label className="min-w-24">تويتر</Label>
                <Input 
                  placeholder="https://twitter.com/..." 
                  dir="ltr" 
                  {...form.register("socialLinks.twitter")}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label className="min-w-24">فيسبوك</Label>
                <Input 
                  placeholder="https://facebook.com/..." 
                  dir="ltr" 
                  {...form.register("socialLinks.facebook")}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Label className="min-w-24">انستغرام</Label>
                <Input 
                  placeholder="https://instagram.com/..." 
                  dir="ltr" 
                  {...form.register("socialLinks.instagram")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default ThemeSettingsForm;
