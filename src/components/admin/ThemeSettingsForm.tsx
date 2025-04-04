
import React from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { ThemeSettingsFormValues } from '@/contexts/admin/types';
import ColorsSection from '@/components/admin/theme/ColorsSection';
import LogoSection from '@/components/admin/theme/LogoSection';
import HeaderFooterSection from '@/components/admin/theme/HeaderFooterSection';
import { Loader2, Check } from 'lucide-react';

type ThemeSettingsFormProps = {
  initialData: ThemeSettingsFormValues;
  onSubmit: (data: ThemeSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
};

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}) => {
  const form = useForm<ThemeSettingsFormValues>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <ColorsSection 
        primaryColor={form.watch("primaryColor")}
        buttonColor={form.watch("buttonColor")}
        textColor={form.watch("textColor")}
        backgroundColor={form.watch("backgroundColor")}
        register={form.register}
        setValue={form.setValue}
      />
      
      <LogoSection 
        logoText={form.watch("logoText")}
        logoFontSize={form.watch("logoFontSize")}
        slug={form.watch("slug")}
        register={form.register}
      />
      
      <HeaderFooterSection 
        headerColor={form.watch("headerColor")}
        footerColor={form.watch("footerColor")}
        footerText={form.watch("footerText")}
        socialLinks={form.watch("socialLinks")}
        register={form.register}
        setValue={form.setValue}
      />
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          'حفظ الإعدادات'
        )}
      </Button>
    </form>
  );
};

export default ThemeSettingsForm;
