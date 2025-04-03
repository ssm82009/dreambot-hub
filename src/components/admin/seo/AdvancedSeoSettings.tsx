
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { SeoSettingsFormValues } from '@/contexts/admin/types';

interface AdvancedSeoSettingsProps {
  form: UseFormReturn<SeoSettingsFormValues>;
}

const AdvancedSeoSettings: React.FC<AdvancedSeoSettingsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="googleAnalyticsId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>معرف Google Analytics</FormLabel>
            <FormControl>
              <Input placeholder="مثال: G-XXXXXXXXXX أو UA-XXXXXXXX-X" {...field} />
            </FormControl>
            <FormDescription>
              معرف تتبع Google Analytics لمراقبة حركة الزوار (اختياري)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customHeadTags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>وسوم HTML مخصصة</FormLabel>
            <FormControl>
              <Textarea
                placeholder="أدخل وسوم HTML مخصصة ستضاف إلى قسم <head>"
                className="font-mono text-sm h-32"
                {...field}
              />
            </FormControl>
            <FormDescription>
              وسوم HTML مخصصة ستضاف إلى قسم head في الصفحة (للمستخدمين المتقدمين)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AdvancedSeoSettings;
