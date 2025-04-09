
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dream } from '@/types/database';

interface DreamDetailsContentProps {
  dreamId?: string;
}

const DreamDetailsContent: React.FC<DreamDetailsContentProps> = ({ dreamId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isFromAdmin, setIsFromAdmin] = useState(false);
  
  useEffect(() => {
    // تحديد ما إذا كان المستخدم قادمًا من لوحة المشرف
    const checkIfFromAdmin = () => {
      const referrer = document.referrer;
      const adminPath = location.state?.from === 'admin';
      const adminReferrer = referrer.includes('/admin');
      
      setIsFromAdmin(adminPath || adminReferrer);
    };

    checkIfFromAdmin();
    
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
        
        // التحقق من أن الحلم ينتمي للمستخدم الحالي أو أن المستخدم مشرف
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        const isAdmin = userData?.role === 'admin';
        
        if (data.user_id !== userId && !isAdmin) {
          setIsAuthorized(false);
          toast.error("لا يمكنك عرض تفاصيل هذا الحلم");
          navigate('/profile');
          return;
        }
        
        setDream(data);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error:', error);
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDreamDetails();
  }, [dreamId, navigate, location.state]);
  
  const handleBack = () => {
    if (isFromAdmin) {
      navigate('/admin', { state: { activeSection: 'dreams' } });
    } else {
      navigate('/profile');
    }
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
            {isFromAdmin ? 'العودة للوحة المشرف' : 'العودة للملف الشخصي'}
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
            {isFromAdmin ? 'العودة للوحة المشرف' : 'العودة'}
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
            {dream.interpretation}
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
        
        <Alert className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-400 mt-2 text-sm">
            <strong>تنبيه مهم:</strong> هذا التفسير ناتج عن الذكاء الاصطناعي ويقدم لأغراض الترفيه والمعلومات فقط. 
            لا ينبغي اتخاذ أي قرارات أو إجراءات في الحياة الواقعية بناءً على هذا التفسير. 
            تطبيق "تاويل" والقائمين عليه يخلون مسؤوليتهم بشكل كامل عن محتوى التفسير وأي نتائج قد تترتب على الاعتماد عليه. 
            يرجى استشارة المختصين المؤهلين قبل اتخاذ أي قرارات مهمة.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="border-t p-6">
        <div className="w-full flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            {isFromAdmin ? 'العودة للوحة المشرف' : 'العودة للملف الشخصي'}
          </Button>
          {/* يمكن إضافة أزرار إضافية هنا مثل زر الطباعة أو المشاركة */}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DreamDetailsContent;
