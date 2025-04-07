
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowRight, Calendar, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dream } from '@/types/database';
import { useStreamingText } from '@/hooks/useStreamingText';

interface DreamDetailsContentProps {
  dreamId?: string;
}

const DreamDetailsContent: React.FC<DreamDetailsContentProps> = ({ dreamId }) => {
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Initialize streaming text with empty string initially
  const { text: streamedInterpretation, isDone: streamingDone } = useStreamingText(
    dream?.interpretation || '', 
    { delay: 20, enabled: true }
  );
  
  useEffect(() => {
    const fetchDreamDetails = async () => {
      if (!dreamId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // التحقق من المستخدم الحالي
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        
        if (!userId) {
          toast.error("يجب تسجيل الدخول لعرض تفاصيل الحلم");
          navigate('/login');
          return;
        }
        
        // جلب تفاصيل الحلم
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
        
        // التحقق من أن الحلم ينتمي للمستخدم الحالي
        if (data.user_id !== userId) {
          setIsAuthorized(false);
          toast.error("لا يمكنك عرض تفاصيل هذا الحلم");
          navigate('/profile');
          return;
        }
        
        setDream(data);
        setIsAuthorized(true);
        console.log("Dream loaded, interpretation length:", data.interpretation?.length || 0);
      } catch (error) {
        console.error('Error:', error);
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDreamDetails();
  }, [dreamId, navigate]);
  
  const handleBack = () => {
    navigate('/profile');
  };
  
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
  
  if (!isAuthorized || !dream) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>خطأ في الوصول</CardTitle>
          <CardDescription>لا يمكن عرض تفاصيل هذا الحلم</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            قد يكون الحلم غير موجود أو أنك لا تملك صلاحية الوصول إليه.
          </p>
          <Button className="mt-4" onClick={handleBack}>
            العودة للملف الشخصي
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">تفاصيل الحلم</CardTitle>
            <CardDescription className="flex items-center mt-2">
              <Calendar className="h-4 w-4 ml-1" />
              {formatDate(dream.created_at)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowRight className="h-4 w-4 ml-1" />
            العودة
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">نص الحلم:</h3>
          <div className="p-4 bg-muted/30 rounded-md whitespace-pre-line">
            {dream.dream_text}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-2">التفسير:</h3>
          <div className="p-4 bg-primary/5 rounded-md whitespace-pre-line border border-primary/10">
            {streamedInterpretation}
            {!streamingDone && <span className="inline-block w-1 h-5 ml-1 bg-primary animate-pulse"></span>}
          </div>
        </div>
        
        {dream.tags && dream.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Tag className="h-4 w-4 ml-1" />
              الوسوم:
            </h3>
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-6">
        <div className="w-full flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            العودة للملف الشخصي
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DreamDetailsContent;
