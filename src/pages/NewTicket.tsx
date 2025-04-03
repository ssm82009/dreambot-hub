
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          title: title.trim(),
          description: description.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('تم إنشاء التذكرة بنجاح');
      navigate(`/tickets/${data.id}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('حدث خطأ أثناء إنشاء التذكرة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 rtl">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">إنشاء تذكرة جديدة</CardTitle>
              <CardDescription>
                يرجى تقديم المعلومات اللازمة للمساعدة في حل مشكلتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان التذكرة</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="أدخل عنوان موجز للمشكلة"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المشكلة</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="يرجى وصف المشكلة أو الطلب بالتفصيل"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/tickets')}
                    disabled={isSubmitting}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال التذكرة'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewTicket;
