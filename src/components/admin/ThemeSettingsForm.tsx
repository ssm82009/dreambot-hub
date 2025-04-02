
import React from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import ColorsSection from '@/components/admin/theme/ColorsSection';
import LogoSection from '@/components/admin/theme/LogoSection';
import HeaderFooterSection from '@/components/admin/theme/HeaderFooterSection';

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
      
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};

export default ThemeSettingsForm;
