
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LogoSectionProps = {
  logoText: string;
  logoFontSize: number;
  slug?: string;
  register: any;
};

const LogoSection: React.FC<LogoSectionProps> = ({ 
  logoText, 
  logoFontSize,
  slug,
  register 
}) => {
  return (
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
            {...register("logoText")}
          />
        </div>
        <div className="space-y-2">
          <Label>حجم خط الشعار</Label>
          <Input 
            type="number" 
            {...register("logoFontSize", { valueAsNumber: true })}
          />
          <p className="text-sm text-muted-foreground">الحجم بوحدة البكسل</p>
        </div>
        <div className="space-y-2">
          <Label>النص التوضيحي تحت الشعار</Label>
          <Input 
            placeholder="تفسير الأحلام عبر الذكاء الاصطناعي" 
            {...register("slug")}
          />
          <p className="text-sm text-muted-foreground">نص وصفي يظهر أسفل الشعار الرئيسي</p>
        </div>
      </div>
    </div>
  );
};

export default LogoSection;
