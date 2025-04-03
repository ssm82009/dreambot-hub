
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { SeoSettingsFormValues } from '@/contexts/admin/types';
import { useAdmin } from '@/contexts/admin';
import { useSeoSettingsHandler } from '@/hooks/settings';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SeoSettingsForm: React.FC = () => {
  const { seoSettingsForm } = useAdmin();
  const { updateSeoSettings, isUpdating, isSuccess } = useSeoSettingsHandler();
  const { toast } = useToast();
  
  const form = useForm<SeoSettingsFormValues>({
    defaultValues: seoSettingsForm
  });

  const onSubmit = async (data: SeoSettingsFormValues) => {
    try {
      await updateSeoSettings(data);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <Button type="submit" className="w-full md:w-auto" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : isSuccess ? (
            <>
              <Check className="ml-2 h-4 w-4" />
              تم الحفظ
            </>
          ) : (
            'حفظ الإعدادات'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SeoSettingsForm;
