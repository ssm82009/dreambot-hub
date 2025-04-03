
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { SeoSettingsFormValues } from '@/contexts/admin/types';
import { useToast } from '@/hooks/use-toast';
import MetaInformationFields from './seo/MetaInformationFields';
import SeoFeatureToggles from './seo/SeoFeatureToggles';
import AdvancedSeoSettings from './seo/AdvancedSeoSettings';
import SeoSubmitButton from './seo/SeoSubmitButton';

interface SeoSettingsFormProps {
  initialData: SeoSettingsFormValues;
  onSubmit: (data: SeoSettingsFormValues) => Promise<{ success: boolean }>;
  isLoading: boolean;
  isSuccess: boolean;
}

const SeoSettingsForm: React.FC<SeoSettingsFormProps> = ({ 
  initialData, 
  onSubmit, 
  isLoading, 
  isSuccess 
}) => {
  const { toast } = useToast();
  
  const form = useForm<SeoSettingsFormValues>({
    defaultValues: initialData
  });

  const handleSubmit = async (data: SeoSettingsFormValues) => {
    try {
      await onSubmit(data);
      toast({
        title: 'تم الحفظ',
        description: 'تم تحديث إعدادات السيو بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث إعدادات السيو',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <MetaInformationFields form={form} />
        <SeoFeatureToggles form={form} />
        <AdvancedSeoSettings form={form} />
        <SeoSubmitButton isUpdating={isLoading} isSuccess={isSuccess} />
      </form>
    </Form>
  );
};

export default SeoSettingsForm;
