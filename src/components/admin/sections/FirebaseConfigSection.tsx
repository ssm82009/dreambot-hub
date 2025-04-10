
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';

const firebaseConfigSchema = z.object({
  project_id: z.string().min(1, 'حقل مطلوب'),
  api_key: z.string().min(1, 'حقل مطلوب'),
  auth_domain: z.string().min(1, 'حقل مطلوب'),
  storage_bucket: z.string().min(1, 'حقل مطلوب'),
  messaging_sender_id: z.string().min(1, 'حقل مطلوب'),
  app_id: z.string().min(1, 'حقل مطلوب'),
  measurement_id: z.string().optional(),
});

type FirebaseFormValues = z.infer<typeof firebaseConfigSchema>;

const FirebaseConfigSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [configExists, setConfigExists] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);

  const form = useForm<FirebaseFormValues>({
    resolver: zodResolver(firebaseConfigSchema),
    defaultValues: {
      project_id: '',
      api_key: '',
      auth_domain: '',
      storage_bucket: '',
      messaging_sender_id: '',
      app_id: '',
      measurement_id: '',
    },
  });

  // جلب إعدادات Firebase الحالية
  useEffect(() => {
    const fetchFirebaseConfig = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('firebase_config')
          .select('*')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const config = data[0];
          setConfigExists(true);
          setConfigId(config.id);
          
          form.reset({
            project_id: config.project_id,
            api_key: config.api_key,
            auth_domain: config.auth_domain,
            storage_bucket: config.storage_bucket,
            messaging_sender_id: config.messaging_sender_id,
            app_id: config.app_id,
            measurement_id: config.measurement_id || '',
          });
        }
      } catch (error) {
        console.error('خطأ في جلب إعدادات Firebase:', error);
        toast.error('فشل في جلب إعدادات Firebase');
      } finally {
        setLoading(false);
      }
    };

    fetchFirebaseConfig();
  }, [form]);

  // حفظ إعدادات Firebase
  const onSubmit = async (values: FirebaseFormValues) => {
    try {
      setLoading(true);

      if (configExists && configId) {
        // تحديث الإعدادات الموجودة
        const { error } = await supabase
          .from('firebase_config')
          .update({
            project_id: values.project_id,
            api_key: values.api_key,
            auth_domain: values.auth_domain,
            storage_bucket: values.storage_bucket, 
            messaging_sender_id: values.messaging_sender_id,
            app_id: values.app_id,
            measurement_id: values.measurement_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', configId);

        if (error) throw error;
        
        toast.success('تم تحديث إعدادات Firebase بنجاح');
      } else {
        // إنشاء إعدادات جديدة
        const { data, error } = await supabase
          .from('firebase_config')
          .insert({
            project_id: values.project_id,
            api_key: values.api_key,
            auth_domain: values.auth_domain,
            storage_bucket: values.storage_bucket,
            messaging_sender_id: values.messaging_sender_id,
            app_id: values.app_id,
            measurement_id: values.measurement_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setConfigId(data[0].id);
          setConfigExists(true);
        }
        
        toast.success('تم حفظ إعدادات Firebase بنجاح');
      }

      // إعادة تحميل الصفحة لتفعيل الإعدادات الجديدة
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('خطأ في حفظ إعدادات Firebase:', error);
      toast.error('فشل في حفظ إعدادات Firebase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات Firebase</CardTitle>
        <CardDescription>
          قم بإعداد خدمة Firebase Cloud Messaging (FCM) لإرسال الإشعارات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرف المشروع (Project ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="my-project-12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      معرف المشروع من إعدادات Firebase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مفتاح API (API Key)</FormLabel>
                    <FormControl>
                      <Input placeholder="AIzaSyA-EXAMPLE-KEY" {...field} />
                    </FormControl>
                    <FormDescription>
                      مفتاح API من إعدادات Firebase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auth_domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نطاق المصادقة (Auth Domain)</FormLabel>
                    <FormControl>
                      <Input placeholder="my-project-12345.firebaseapp.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storage_bucket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>خانة التخزين (Storage Bucket)</FormLabel>
                      <FormControl>
                        <Input placeholder="my-project-12345.appspot.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="messaging_sender_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معرف المرسل (Messaging Sender ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="app_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معرف التطبيق (App ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="1:123456789012:web:abcdef1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurement_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معرف القياس (Measurement ID) - اختياري</FormLabel>
                      <FormControl>
                        <Input placeholder="G-XXXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    حفظ الإعدادات
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 p-4 border rounded-lg bg-amber-50 border-amber-200">
          <h3 className="text-sm font-medium text-amber-800 mb-2">تذكير مهم</h3>
          <p className="text-xs text-amber-700">
            لا تنسَ إضافة سر خادم FCM (FCM Server Key) في الإعدادات السرية للوظائف الطرفية (Edge Functions).
            يمكنك الحصول على هذا المفتاح من لوحة تحكم Firebase عبر Project settings &gt; Cloud Messaging &gt; Server key.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseConfigSection;
