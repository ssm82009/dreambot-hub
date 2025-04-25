
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FirebaseConfig {
  id?: string;
  api_key: string;
  auth_domain: string;
  project_id: string;
  storage_bucket: string;
  messaging_sender_id: string;
  app_id: string;
  measurement_id?: string;
}

const FirebaseConfigSection = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FirebaseConfig>({
    defaultValues: {
      api_key: '',
      auth_domain: '',
      project_id: '',
      storage_bucket: '',
      messaging_sender_id: '',
      app_id: '',
      measurement_id: '',
    }
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('firebase_config')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
          throw error;
        }

        if (data) {
          // Convert to FirebaseConfig type
          const config: FirebaseConfig = {
            id: String(data.id || ''),
            api_key: String(data.api_key || ''),
            auth_domain: String(data.auth_domain || ''),
            project_id: String(data.project_id || ''),
            storage_bucket: String(data.storage_bucket || ''),
            messaging_sender_id: String(data.messaging_sender_id || ''),
            app_id: String(data.app_id || ''),
            measurement_id: data.measurement_id ? String(data.measurement_id) : '',
          };
          form.reset(config);
        }
      } catch (error) {
        console.error('Error fetching Firebase config:', error);
        toast.error('خطأ في جلب بيانات Firebase');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [form]);

  const onSubmit = async (values: FirebaseConfig) => {
    setLoading(true);
    try {
      const configToSave: any = {
        api_key: values.api_key,
        auth_domain: values.auth_domain,
        project_id: values.project_id,
        storage_bucket: values.storage_bucket,
        messaging_sender_id: values.messaging_sender_id,
        app_id: values.app_id,
        measurement_id: values.measurement_id || ''
      };

      const { data, error } = await supabase
        .from('firebase_config')
        .select('id')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && typeof data === 'object' && 'id' in data) {
        // Update existing config
        const { error: updateError } = await supabase
          .from('firebase_config')
          .update(configToSave)
          .eq('id', data.id);

        if (updateError) throw updateError;
      } else {
        // Insert new config
        const { error: insertError } = await supabase
          .from('firebase_config')
          .insert([configToSave]);

        if (insertError) throw insertError;
      }

      toast.success('تم حفظ إعدادات Firebase بنجاح');
    } catch (error) {
      console.error('Error saving Firebase config:', error);
      toast.error('خطأ في حفظ إعدادات Firebase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>إعدادات Firebase</CardTitle>
        <CardDescription>
          قم بتكوين إعدادات Firebase لدعم الإشعارات
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="AIza..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="auth_domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="project-id.firebaseapp.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project ID</FormLabel>
                  <FormControl>
                    <Input placeholder="project-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="storage_bucket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Bucket</FormLabel>
                  <FormControl>
                    <Input placeholder="project-id.appspot.com" {...field} />
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
                  <FormLabel>Messaging Sender ID</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="app_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App ID</FormLabel>
                  <FormControl>
                    <Input placeholder="1:123456789012:web:abc123def456" {...field} />
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
                  <FormLabel>Measurement ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="G-ABCDEF1234" {...field} />
                  </FormControl>
                  <FormDescription>
                    يستخدم لتتبع Google Analytics (اختياري)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="ml-2 h-4 w-4" />
              )}
              حفظ الإعدادات
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default FirebaseConfigSection;
