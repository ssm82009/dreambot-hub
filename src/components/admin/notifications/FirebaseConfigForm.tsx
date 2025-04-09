import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { FirebaseConfig } from '@/types/database';

// نموذج التحقق من صحة البيانات
const firebaseConfigSchema = z.object({
  apiKey: z.string().min(1, { message: 'مطلوب إدخال مفتاح API' }),
  authDomain: z.string().min(1, { message: 'مطلوب إدخال نطاق المصادقة' }),
  projectId: z.string().min(1, { message: 'مطلوب إدخال معرّف المشروع' }),
  storageBucket: z.string().min(1, { message: 'مطلوب إدخال معرّف التخزين' }),
  messagingSenderId: z.string().min(1, { message: 'مطلوب إدخال معرّف مرسل الرسائل' }),
  appId: z.string().min(1, { message: 'مطلوب إدخال معرّف التطبيق' }),
  measurementId: z.string().optional(),
});

// نوع بيانات النموذج
type FirebaseConfigFormValues = z.infer<typeof firebaseConfigSchema>;

const FirebaseConfigForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<FirebaseConfigFormValues | null>(null);

  // إعداد نموذج React Hook Form مع التحقق من صحة البيانات
  const form = useForm<FirebaseConfigFormValues>({
    resolver: zodResolver(firebaseConfigSchema),
    defaultValues: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      measurementId: '',
    },
  });

  // جلب بيانات التكوين الحالية
  useEffect(() => {
    const fetchCurrentConfig = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('firebase_config')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1) as { data: FirebaseConfig[] | null, error: any };

        if (error) throw error;

        if (data && data.length > 0) {
          const config = data[0];
          setInitialValues({
            apiKey: config.api_key,
            authDomain: config.auth_domain,
            projectId: config.project_id,
            storageBucket: config.storage_bucket,
            messagingSenderId: config.messaging_sender_id,
            appId: config.app_id,
            measurementId: config.measurement_id || '',
          });

          form.reset({
            apiKey: config.api_key,
            authDomain: config.auth_domain,
            projectId: config.project_id,
            storageBucket: config.storage_bucket,
            messagingSenderId: config.messaging_sender_id,
            appId: config.app_id,
            measurementId: config.measurement_id || '',
          });
        }
      } catch (error) {
        console.error('فشل في جلب تكوين Firebase:', error);
        toast.error('حدث خطأ أثناء جلب تكوين Firebase');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentConfig();
  }, [form]);

  // معالجة حفظ النموذج
  const onSubmit = async (values: FirebaseConfigFormValues) => {
    try {
      setLoading(true);

      const { error } = await supabase.from('firebase_config').insert({
        api_key: values.apiKey,
        auth_domain: values.authDomain,
        project_id: values.projectId,
        storage_bucket: values.storageBucket,
        messaging_sender_id: values.messagingSenderId,
        app_id: values.appId,
        measurement_id: values.measurementId,
      } as Partial<FirebaseConfig>);

      if (error) throw error;

      toast.success('تم حفظ تكوين Firebase بنجاح');
    } catch (error) {
      console.error('فشل في حفظ تكوين Firebase:', error);
      toast.error('حدث خطأ أثناء حفظ تكوين Firebase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تكوين Firebase</CardTitle>
        <CardDescription>
          أدخل معلومات تكوين Firebase للإشعارات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مفتاح API</FormLabel>
                    <FormControl>
                      <Input placeholder="AIzaSyBzL5x6Cu9fkaynW0keptNdB26OAE5d694" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="authDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نطاق المصادقة</FormLabel>
                    <FormControl>
                      <Input placeholder="example.firebaseapp.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرّف المشروع</FormLabel>
                    <FormControl>
                      <Input placeholder="my-project-id" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageBucket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرّف التخزين</FormLabel>
                    <FormControl>
                      <Input placeholder="example.appspot.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messagingSenderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرّف مرسل الرسائل</FormLabel>
                    <FormControl>
                      <Input placeholder="469199706159" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرّف التطبيق</FormLabel>
                    <FormControl>
                      <Input placeholder="1:469199706159:web:a8673ea99574c71c104eda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="measurementId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>معرّف القياس (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="G-1BVS1GM817" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ التكوين
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FirebaseConfigForm;
