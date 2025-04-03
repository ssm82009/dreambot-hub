
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { CustomPage } from '@/types/database';

interface PageManagementFormProps {
  onPageSave: (page: Partial<CustomPage>) => Promise<void>;
  page?: CustomPage;
  mode: 'create' | 'edit';
}

const formSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون أكثر من 3 أحرف'),
  slug: z.string().min(2, 'المسار يجب أن يكون أكثر من حرفين')
    .regex(/^[a-z0-9-]+$/, 'المسار يجب أن يحتوي على أحرف لاتينية صغيرة وأرقام وشرطات فقط'),
  content: z.string().min(10, 'المحتوى يجب أن يكون أكثر من 10 أحرف'),
  status: z.enum(['published', 'draft']),
});

const PageManagementForm: React.FC<PageManagementFormProps> = ({ onPageSave, page, mode }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page?.title || '',
      slug: page?.slug || '',
      content: page?.content || '',
      status: page?.status as 'published' | 'draft' || 'draft',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await onPageSave({
        id: page?.id,
        title: values.title,
        slug: values.slug,
        content: values.content,
        status: values.status,
      });
      
      toast.success(mode === 'create' ? 'تم إنشاء الصفحة بنجاح' : 'تم تحديث الصفحة بنجاح');
      setOpen(false);
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('حدث خطأ أثناء حفظ الصفحة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'create' ? 'default' : 'outline'}>
          {mode === 'create' ? 'إضافة صفحة جديدة' : 'تعديل'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rtl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'إضافة صفحة جديدة' : 'تحرير الصفحة'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'قم بإنشاء صفحة مخصصة جديدة للعرض على الموقع' 
              : 'تعديل محتوى وإعدادات الصفحة المخصصة'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الصفحة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الصفحة" {...field} />
                  </FormControl>
                  <FormDescription>
                    هذا العنوان سيظهر في أعلى الصفحة وفي نتائج البحث
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مسار الصفحة</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="مثال: about-us" 
                      {...field} 
                      disabled={page?.slug === 'home'} 
                    />
                  </FormControl>
                  <FormDescription>
                    المسار الذي سيظهر في URL. استخدم أحرف لاتينية صغيرة وأرقام وشرطات فقط.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى الصفحة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل محتوى الصفحة هنا..." 
                      {...field} 
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الصفحة</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الصفحة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">منشورة</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    الصفحات المنشورة ستكون مرئية للزوار، والمسودات لن تكون مرئية.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'جارٍ الحفظ...' : mode === 'create' ? 'إنشاء الصفحة' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PageManagementForm;
