
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { SeoSettingsFormValues } from '@/contexts/admin/types';

interface MetaInformationFieldsProps {
  form: UseFormReturn<SeoSettingsFormValues>;
}

const MetaInformationFields: React.FC<MetaInformationFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="metaTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عنوان الموقع (Meta Title)</FormLabel>
            <FormControl>
              <Input placeholder="عنوان الموقع" {...field} />
            </FormControl>
            <FormDescription>
              عنوان الموقع الذي سيظهر في نتائج البحث (60-70 حرف)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>وصف الموقع (Meta Description)</FormLabel>
            <FormControl>
              <Textarea placeholder="وصف الموقع" {...field} />
            </FormControl>
            <FormDescription>
              وصف مختصر للموقع يظهر في نتائج البحث (150-160 حرف)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الكلمات المفتاحية (Keywords)</FormLabel>
            <FormControl>
              <Textarea placeholder="الكلمات المفتاحية مفصولة بفواصل" {...field} />
            </FormControl>
            <FormDescription>
              الكلمات المفتاحية التي تساعد في تحسين ظهور الموقع في نتائج البحث
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default MetaInformationFields;
