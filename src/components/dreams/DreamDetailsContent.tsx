import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DreamDetailsContentProps {
  dreamId?: string;
}

const DreamDetailsContent: React.FC<DreamDetailsContentProps> = ({ dreamId }) => {
  const [dream, setDream] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDreamDetails = async () => {
      if (!dreamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('dreams')
          .select('*')
          .eq('id', dreamId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching dream details:', error);
          toast.error("حدث خطأ أثناء تحميل تفاصيل الحلم");
          setIsLoading(false);
          return;
        }

        if (!data) {
          toast.error("لم يتم العثور على الحلم المطلوب");
          navigate('/profile');
          return;
        }

        setDream(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreamDetails();
  }, [dreamId, navigate]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الحلم</CardTitle>
          <CardDescription>جاري تحميل التفاصيل...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="max-w-4xl mx-auto shadow-md"
      style={{ direction: 'rtl', fontFamily: "'Tajawal', 'Cairo', 'Arial', sans-serif" }}
    >
      <CardHeader>
        <CardTitle>تفاصيل الحلم</CardTitle>
        <CardDescription className="flex items-center text-muted-foreground">
          {formatDate(dream.created_at)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <h3 className="text-lg font-semibold text-primary/90">نص الحلم:</h3>
        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-line text-foreground/80 leading-relaxed">
          {dream.dream_text}
        </div>

        <h3 className="text-lg font-semibold text-primary/90">التفسير:</h3>
        <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-line text-foreground/80 leading-relaxed">
          {dream.interpretation}
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
          العودة للملف الشخصي
        </Button>
      </CardContent>
    </Card>
  );
};

export default DreamDetailsContent;
