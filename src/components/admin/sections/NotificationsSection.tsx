import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendNotificationToAdmin } from '@/services/notificationService';
import { Loader2, Bell, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(1, 'يجب إدخال عنوان الإشعار').max(100, 'العنوان طويل جدًا'),
  body: z.string().min(1, 'يجب إدخال محتوى الإشعار').max(500, 'المحتوى طويل جدًا'),
  type: z.enum(['general', 'ticket', 'payment', 'subscription'], {
    required_error: 'يجب اختيار نوع الإشعار',
  }),
  url: z.string().optional(),
  targetType: z.enum(['all', 'admin', 'specificUser'], {
    required_error: 'يجب اختيار نوع المستقبل',
  }),
  userId: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof formSchema>;

const NotificationsSection: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [sending, setSending] = useState<boolean>(false);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      body: '',
      type: 'general',
      url: '/',
      targetType: 'all',
      userId: '',
    },
  });

  const targetType = form.watch('targetType');

  // جلب عدد المشتركين وقائمة المستخدمين عند تحميل المكون
  useEffect(() => {
    const fetchSubscribersCount = async () => {
      try {
        setLoading(true);
        
        // استدعاء وظيفة Edge Function لإنشاء وظيفة العد
        await supabase.functions.invoke('create-rpc');
        
        // استدعاء العدد مباشرة من قاعدة البيانات
        const { data: countData, error: countError } = await supabase.rpc('count_push_subscriptions');

        if (countError) {
          toast.error('حدث خطأ في جلب عدد المشتركين');
          console.error('خطأ في جلب عدد المشتركين:', countError);
          setSubscribersCount(0);
        } else {
          // تأكد من أن countData عدد صحيح
          setSubscribersCount(typeof countData === 'number' ? countData : 0);
        }

        // جلب قائمة المستخدمين
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email');

        if (userError) {
          toast.error('حدث خطأ في جلب قائمة المستخدمين');
          console.error('خطأ في جلب قائمة المستخدمين:', userError);
          return;
        }

        setUsers(userData || []);
      } catch (error) {
        console.error('خطأ غير متوقع:', error);
        toast.error('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribersCount();
  }, []);

  const onSubmit = async (values: NotificationFormValues) => {
    try {
      setSending(true);
      const { title, body, type, url, targetType, userId } = values;
      
      const notification = {
        title,
        body,
        type,
        url: url || '/',
      };

      let result;
      let message = '';

      // إرسال الإشعار بناءً على نوع المستهدف
      if (targetType === 'admin') {
        result = await sendNotificationToAdmin(notification);
        message = 'تم إرسال الإشعار للمشرفين بنجاح';
      } else if (targetType === 'specificUser' && userId) {
        // استدعاء وظيفة Edge Function لإرسال إشعار لمستخدم محدد
        result = await supabase.functions.invoke('send-notification', {
          body: {
            userId,
            notification
          }
        });
        message = 'تم إرسال الإشعار للمستخدم بنجاح';
      } else if (targetType === 'all') {
        // استدعاء وظيفة Edge Function لإرسال إشعار لجميع المستخدمين
        result = await supabase.functions.invoke('send-notification', {
          body: {
            allUsers: true,
            notification
          }
        });
        message = 'تم إرسال الإشعار لجميع المستخدمين بنجاح';
      }

      if (result?.error) {
        throw new Error(result.error.message);
      }

      toast.success(message);
      form.reset();
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      toast.error('حدث خطأ في إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الإشعارات</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>إحصائيات الإشعارات</CardTitle>
            <CardDescription>تفاصيل عن المشتركين في الإشعارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عدد المشتركين</span>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {subscribersCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">حول الإشعارات</h4>
              <p className="text-sm text-muted-foreground">
                يمكنك إرسال إشعارات مباشرة للمستخدمين المشتركين في خدمة الإشعارات.
                يجب أن يكون المستخدمون قد فعّلوا الإشعارات من متصفحاتهم لاستلامها.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>إرسال إشعار جديد</CardTitle>
            <CardDescription>أرسل إشعارات للمستخدمين والمشرفين</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الإشعار</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنوان الإشعار" {...field} />
                      </FormControl>
                      <FormDescription>
                        عنوان الإشعار الذي سيظهر للمستخدم
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>محتوى الإشعار</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل محتوى الإشعار" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        محتوى الإشعار الذي سيظهر للمستخدم
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الإشعار</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الإشعار" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">عام</SelectItem>
                            <SelectItem value="ticket">تذكرة</SelectItem>
                            <SelectItem value="payment">دفع</SelectItem>
                            <SelectItem value="subscription">اشتراك</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط التوجيه (اختياري)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: /profile" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          المسار الذي سيتم توجيه المستخدم إليه عند النقر على الإشعار
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>إرسال إلى</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستقبل" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">جميع المستخدمين</SelectItem>
                          <SelectItem value="admin">المشرفين فقط</SelectItem>
                          <SelectItem value="specificUser">مستخدم محدد</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {targetType === 'specificUser' && (
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اختر المستخدم</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مستخدم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      إرسال الإشعار
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsSection;
