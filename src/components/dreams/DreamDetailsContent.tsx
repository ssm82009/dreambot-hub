import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, Calendar, Tag, Copy, Printer, Share } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dream } from '@/types/database';
import html2canvas from 'html2canvas';

interface DreamDetailsContentProps {
  dreamId?: string;
}

const renderBoldText = (text: string) => {
  return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const captureAndShare = async (elementRef: React.RefObject<HTMLDivElement>, title: string) => {
  if (!elementRef.current) return;

  const element = elementRef.current;
  try {
    const cardHtmlElement = (element.closest('.dream-card') || element) as HTMLElement;

    const options = {
      backgroundColor: '#ffffff',
      useCORS: true,
      scrollY: -window.scrollY,
      scale: 2,
      width: cardHtmlElement.offsetWidth,
      height: cardHtmlElement.offsetHeight,
      fontFamily: "'Cairo', 'Arial', sans-serif"
    };

    const canvas = await html2canvas(cardHtmlElement, options);
    const imageData = canvas.toDataURL('image/png');

    if ('share' in navigator) {
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], 'dream-interpretation.png', { type: 'image/png' });

      await navigator.share({
        title: title,
        text: 'شاهد تفسير حلمي من تطبيق تأويل',
        files: [file]
      });
    } else {
      const link = document.createElement('a');
      link.download = 'dream-interpretation.png';
      link.href = imageData;
      link.click();
      return "downloaded";
    }

    return "shared";
  } catch (error) {
    console.error('Error during capture and share:', error);
    throw error;
  }
};

const DreamDetailsContent: React.FC<DreamDetailsContentProps> = ({ dreamId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dream, setDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isFromAdmin, setIsFromAdmin] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const interpretationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;

        if (!userId) {
          toast.error("يجب تسجيل الدخول لعرض تفاصيل الحلم");
          navigate('/login');
          return;
        }

        const { data, error } = await supabase.from('dreams').select('*').eq('id', dreamId).maybeSingle();

        if (error || !data) {
          toast.error("حدث خطأ أثناء تحميل تفاصيل الحلم");
          navigate('/profile');
          return;
        }

        const { data: userData } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
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

  const handleCopyToClipboard = () => {
    if (dream?.interpretation) {
      navigator.clipboard.writeText(dream.interpretation);
      toast.success("تم نسخ التفسير إلى الحافظة");
    }
  };

  const handlePrint = () => {
    if (!dream?.interpretation) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تفسير الحلم</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700&display=swap');
            body {
              font-family: 'Cairo', Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
              direction: rtl;
              text-align: right;
            }
            .dream-content {
              margin: 20px 0;
              white-space: pre-line;
              border: 1px solid #eee;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .interpretation {
              margin: 20px 0;
              white-space: pre-line;
              border: 1px solid #e0f2ff;
              padding: 15px;
              background-color: #f0f9ff;
              border-radius: 8px;
            }
            .disclaimer {
              margin-top: 30px;
              padding: 15px;
              border: 1px solid #f0ad4e;
              background-color: #fcf8e3;
              border-radius: 4px;
            }
            h2, h3 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <h2>تفسير الحلم</h2>
          <h3>نص الحلم:</h3>
          <div class="dream-content">${dream.dream_text}</div>
          <h3>التفسير:</h3>
          <div class="interpretation">${dream.interpretation}</div>
          <div class="disclaimer">
            <strong>تنبيه مهم:</strong> هذا التفسير ناتج عن الذكاء الاصطناعي ويقدم لأغراض الترفيه والمعلومات فقط.
            لا ينبغي اتخاذ أي قرارات أو إجراءات في الحياة الواقعية بناءً على هذا التفسير.
            تطبيق "تاويل" والقائمين عليه يخلون مسؤوليتهم بشكل كامل عن محتوى التفسير وأي نتائج قد تترتب على الاعتماد عليه.
            يرجى استشارة المختصين المؤهلين قبل اتخاذ أي قرارات مهمة.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleShare = async () => {
    if (!interpretationRef.current || !dream?.interpretation) return;

    setIsSharing(true);
    try {
      const result = await captureAndShare(interpretationRef, 'تفسير الحلم - تأويل');

      if (result === "shared") {
        toast.success("تمت مشاركة التفسير بنجاح");
      } else if (result === "downloaded") {
        toast.success("تم حفظ صورة التفسير بنجاح");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("حدث خطأ أثناء المشاركة");
    } finally {
      setIsSharing(false);
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

  const canShare = 'share' in navigator;

  return (
    <Card className="max-w-4xl mx-auto shadow-md dream-card" style={{ fontFamily: "'Cairo', 'Arial', sans-serif", direction: 'rtl' }}>
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-primary">تفاصيل الحلم</CardTitle>
            <CardDescription className="flex items-center text-muted-foreground">
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary/90">نص الحلم:</h3>
          <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-line text-foreground/80 leading-relaxed">
            {dream.dream_text}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary/90">التفسير:</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                نسخ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                طباعة
              </Button>
              {canShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  {isSharing ? "جارٍ المشاركة..." : "مشاركة"}
                </Button>
              )}
            </div>
          </div>

          <div ref={interpretationRef} className="rounded-lg overflow-hidden">
            <div className="bg-white p-6 space-y-6">
              <div className="whitespace-pre-line text-foreground/90 leading-relaxed tracking-wide selection:bg-primary/20 prose prose-sm max-w-none">
                {renderBoldText(dream.interpretation)}
              </div>

              <Alert className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertDescription className="text-amber-800 dark:text-amber-400 mt-2 text-sm">
                  <strong className="block mb-2">تنبيه مهم من تأويل | Taweel.app</strong>
                  هذا التفسير ناتج عن الذكاء الاصطناعي ويقدم لأغراض الترفيه والمعلومات فقط. 
                  لا ينبغي اتخاذ أي قرارات أو إجراءات في الحياة الواقعية بناءً على هذا التفسير. 
                  تطبيق "تاويل" والقائمين عليه يخلون مسؤوليتهم بشكل كامل عن محتوى التفسير وأي نتائج قد تترتب على الاعتماد عليه. 
                  يرجى استشارة المختصين المؤهلين قبل اتخاذ أي قرارات مهمة.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        {dream.tags && dream.tags.length > 0 && (
          <div className="pt-4">
            <h3 className="text-lg font-semibold flex items-center text-primary/90 mb-3">
              <Tag className="h-4 w-4 ml-1" />
              الوسوم:
            </h3>
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-primary/5 text-primary/70 rounded-full text-sm">
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
            {isFromAdmin ? 'العودة للوحة المشرف' : 'العودة للملف الشخصي'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DreamDetailsContent;
