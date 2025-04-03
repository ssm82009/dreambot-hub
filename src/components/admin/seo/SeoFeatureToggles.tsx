
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { SeoSettingsFormValues } from '@/contexts/admin/types';

interface SeoFeatureTogglesProps {
  form: UseFormReturn<SeoSettingsFormValues>;
}

const SeoFeatureToggles: React.FC<SeoFeatureTogglesProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="enableSitemap"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">خريطة الموقع (Sitemap)</FormLabel>
              <FormDescription>
                تفعيل خريطة الموقع لمحركات البحث
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enableRobotsTxt"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">ملف Robots.txt</FormLabel>
              <FormDescription>
                تفعيل ملف إرشادات لعناكب محركات البحث
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enableCanonicalUrls"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">روابط Canonical</FormLabel>
              <FormDescription>
                لتجنب مشكلة المحتوى المكرر
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enableOpenGraph"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">وسوم Open Graph</FormLabel>
              <FormDescription>
                لتحسين ظهور المحتوى عند المشاركة على مواقع التواصل
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enableTwitterCards"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <FormLabel className="text-base">بطاقات تويتر</FormLabel>
              <FormDescription>
                لتحسين ظهور المحتوى عند المشاركة على تويتر
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default SeoFeatureToggles;
