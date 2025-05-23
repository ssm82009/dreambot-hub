import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, Printer, AlertTriangle, Lock } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DreamSymbol, InterpretationSettings } from '@/types/database';
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { getTotalInterpretations } from '@/utils/subscription';
import html2canvas from 'html2canvas';
const renderBoldText = (text: string) => {
  return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};
const DreamForm = () => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dreamSymbols, setDreamSymbols] = useState<DreamSymbol[]>([]);
  const [aiSettings, setAiSettings] = useState<any | null>(null);
  const [interpretationSettings, setInterpretationSettings] = useState<InterpretationSettings | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [usedInterpretations, setUsedInterpretations] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [subscriptionUsage, setSubscriptionUsage] = useState<{
    interpretations_used: number;
    subscription_type: string;
    subscription_expires_at: string | null;
  } | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchDreamSymbols();
    fetchSettings();
    checkAuth();
  }, []);
  useEffect(() => {
    setCharCount(dreamText.length);
    setWordCount(dreamText.trim() ? dreamText.trim().split(/\s+/).length : 0);
  }, [dreamText]);
  useEffect(() => {
    if (userId) {
      fetchUserSubscription();
      fetchUsedInterpretations();
      fetchPricingSettings();
    }
  }, [userId]);
  useEffect(() => {
    if (userSubscription && pricingSettings && subscriptionUsage) {
      const checkLimit = async () => {
        try {
          const totalAllowed = await getTotalInterpretations(userSubscription);
          const isLimited = totalAllowed !== -1 && subscriptionUsage.interpretations_used >= totalAllowed;
          setHasReachedLimit(isLimited);
        } catch (error) {
          console.error("Error checking subscription limits:", error);
          setHasReachedLimit(false);
        }
      };
      checkLimit();
    }
  }, [userSubscription, pricingSettings, subscriptionUsage]);
  const checkAuth = async () => {
    try {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setIsAuthenticated(true);
        console.log("User authenticated:", data.session.user.id);
      } else {
        console.log("User not authenticated");
        setIsAuthenticated(false);
        setUserId(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    }
  };
  const fetchUserSubscription = async () => {
    try {
      if (!userId) return;
      const {
        data: userData,
        error: userError
      } = await supabase.from('users').select('*').eq('id', userId as any).single();
      if (userError) {
        console.error("Error fetching user subscription:", userError);
        return;
      }
      setUserSubscription(userData);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
    }
  };
  const fetchUsedInterpretations = async () => {
    try {
      if (!userId) return;
      const {
        count,
        error
      } = await supabase.from('dreams').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', userId as any);
      if (error) {
        console.error("Error fetching dreams count:", error);
        return;
      }
      setUsedInterpretations(count || 0);
    } catch (error) {
      console.error("Error counting dreams:", error);
    }
  };
  const fetchPricingSettings = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('pricing_settings').select('*').limit(1).single();
      if (error) {
        console.error("Error fetching pricing settings:", error);
        return;
      }
      setPricingSettings(data);
    } catch (error) {
      console.error("Error fetching pricing settings:", error);
    }
  };
  const fetchSettings = async () => {
    try {
      const {
        data: aiData,
        error: aiError
      } = await supabase.from('ai_settings').select('*').limit(1).maybeSingle();
      if (aiError) {
        console.error("خطأ في جلب إعدادات الذكاء الاصطناعي:", aiError);
      } else if (aiData) {
        setAiSettings(aiData);
      }
      const {
        data: interpretationData,
        error: interpretationError
      } = await supabase.from('interpretation_settings').select('*').limit(1).maybeSingle();
      if (interpretationError) {
        console.error("خطأ في جلب إعدادات التفسير:", interpretationError);
      } else if (interpretationData) {
        setInterpretationSettings(interpretationData as unknown as InterpretationSettings);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بقاعدة البيانات:", error);
    }
  };
  const fetchDreamSymbols = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('dream_symbols').select('*');
      if (error) {
        console.error("خطأ في جلب رموز الأحلام:", error);
      } else if (data) {
        setDreamSymbols(data as unknown as DreamSymbol[]);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بقاعدة البيانات:", error);
    }
  };
  const interpretDream = async (dream: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling interpret-dream function with dream text:", dream.substring(0, 50) + "...");
      const {
        data: aiResponse,
        error: invokeError
      } = await supabase.functions.invoke('interpret-dream', {
        body: {
          dreamText: dream
        }
      });
      if (invokeError) {
        console.error("خطأ في استدعاء وظيفة تفسير الحلم:", invokeError);
        setError(invokeError.message || "فشل في استدعاء وظيفة تفسير الحلم");
        toast.error("حدث خطأ أثناء تفسير الحلم، يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        return;
      }
      if (aiResponse.error) {
        console.error("خطأ من وظيفة تفسير الحلم:", aiResponse.error);
        setError(aiResponse.error);
        toast.error("حدث خطأ في معالجة الحلم: " + aiResponse.error);
        setIsLoading(false);
        return;
      }
      const generatedInterpretation = aiResponse?.interpretation || "لم نتمكن من الحصول على تفسير في هذا الوقت.";
      console.log("Received interpretation successfully");
      try {
        if (userId) {
          const extractedTags = extractKeywords(dream);
          console.log("Extracted tags:", extractedTags);
          const {
            error: insertError
          } = await supabase.from('dreams').insert({
            dream_text: dream,
            interpretation: generatedInterpretation,
            user_id: userId as any,
            tags: extractedTags
          } as any);
          if (insertError) {
            console.error("خطأ في حفظ الحلم:", insertError);
            toast.error("حدث خطأ عند حفظ الحلم، ولكن تم الحصول على التفسير");
          } else {
            toast.success("تم حفظ الحلم وتفسيره بنجاح");
          }
        }
      } catch (saveError) {
        console.error("خطأ في حفظ الحلم في قاعدة البيانات:", saveError);
        toast.error("تم تفسير الحلم ولكن لم يتم حفظه في سجلاتك");
      }
      setInterpretation(generatedInterpretation);
    } catch (error) {
      console.error("خطأ في تفسير الحلم:", error);
      setError(`خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      toast.error("حدث خطأ أثناء تفسير الحلم");
    } finally {
      setIsLoading(false);
    }
  };
  const extractKeywords = (text: string): string[] => {
    const commonKeywords = ['ماء', 'طيران', 'سقوط', 'موت', 'مطاردة', 'سفر', 'بيت', 'أسنان', 'فقدان', 'قطة', 'كلب', 'ثعبان', 'طفل', 'امتحان', 'تأخر', 'نجاح', 'فشل', 'زواج', 'مطر', 'شمس', 'ريح', 'سماء', 'نجوم', 'قمر', 'كتاب', 'قلم', 'ورقة', 'مدرسة', 'جامعة', 'تعلم', 'صديق', 'عائلة', 'أم', 'أب', 'أخ', 'أخت', 'طعام', 'خبز', 'فواكه', 'تفاح', 'موز', 'عنب', 'سيارة', 'دراجة', 'طريق', 'سفر', 'رحلة', 'بحر', 'جبل', 'صحراء', 'نهر', 'شجرة', 'زهرة', 'عشب', 'ليل', 'نهار', 'صباح', 'مساء', 'وقت', 'ساعة', 'فرح', 'حزن', 'ضحك', 'بكاء', 'قلب', 'روح', 'يد', 'رجل', 'عين', 'أذن', 'فم', 'رأس', 'ملابس', 'قميص', 'حذاء', 'بنطال', 'فستان', 'قبعة', 'عمل', 'وظيفة', 'مشروع', 'مال', 'فقر', 'غنى', 'حرب', 'سلام', 'أمان', 'خوف', 'حلم', 'حقيقة', 'حرية', 'سجن', 'عدل', 'ظلم', 'قوة', 'ضعف', 'صحة', 'مرض', 'دواء', 'مستشفى', 'طبيب', 'تمريض', 'رياضة', 'كرة', 'سباحة', 'جري', 'قفز', 'تسلق', 'فن', 'رسم', 'موسيقى', 'غناء', 'رقص', 'مسرح', 'تكنولوجيا', 'هاتف', 'كمبيوتر', 'إنترنت', 'برمجة', 'ذكاء', 'حيوان', 'أسد', 'نمر', 'فيل', 'زرافة', 'دب', 'طائر', 'عصفور', 'نسر', 'ببغاء', 'حمامة', 'بومة', 'سمك', 'قرش', 'دلفين', 'حوت', 'جمبري', 'سلحفاة', 'لون', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'أسود', 'طقس', 'برد', 'حر', 'ثلج', 'ضباب', 'عاصفة', 'مدينة', 'قرية', 'شارع', 'حديقة', 'مبنى', 'جسر', 'حقيبة', 'مفتاح', 'ساعة', 'نظارة', 'خاتم', 'سلسلة', 'ضوء', 'ظلام', 'ظل', 'شعلة', 'شمعة', 'مصباح', 'صوت', 'صمت', 'ضجة', 'همس', 'صراخ', 'غناء', 'رائحة', 'عطر', 'دخان', 'طعام', 'زهر', 'تراب', 'طعم', 'حلو', 'مر', 'مالح', 'حامض', 'لاذع', 'لمس', 'ناعم', 'خشن', 'بارد', 'ساخن', 'مبلل', 'ملمس', 'حرير', 'قطن', 'صوف', 'جلد', 'بلاستيك', 'قراءة', 'ك��ابة', 'حساب', 'تفكير', 'تخيل', 'تذكر', 'ابتكار', 'اختراع', 'اكت��اف', 'بحث', 'دراسة', 'تحليل', 'بناء', 'هدم', 'إصلاح', 'تركيب', 'صنع', 'تدمير', 'زراعة', 'حصاد', 'بذرة', 'تربة', 'سقي', 'نمو', 'بيع', 'شراء', 'تجارة', 'سوق', 'ربح', 'خسارة', 'هدية', 'مفاجأة', 'سر', 'وعد', 'كذبة', 'حقيقة', 'بداية', 'نهاية', 'تغيير', 'ثبات', 'تقدم', 'تراجع', 'قديم', 'جديد', 'عتيق', 'حديث', 'تقليدي', 'عصري', 'كبير', 'صغير', 'طويل', 'قصير', 'سمين', 'نحيف', 'ثقيل', 'خفيف', 'قاس', 'لين', 'سريع', 'بطيء', 'غريب', 'مألوف', 'مختلف', 'متشابه', 'بسيط', 'معقد', 'نظيف', 'وسخ', 'مرتب', 'فوضوي', 'جذاب', 'منفر', 'سعيد', 'غاضب', 'متفائل', 'متشائم', 'هادئ', 'قلق', 'شجاع', 'جبان', 'صبور', 'عجول', 'كريم', 'بخيل', 'ذكي', 'غبي', 'ماهر', 'غير كفء', 'صادق', 'كاذب', 'ودود', 'عدائي', 'اجتماعي', 'انطوائي', 'مرح', 'جاد', 'مستقبل', 'ماضي', 'حاضر', 'ذكرى', 'أمل', 'ندم', 'خيال', 'واقع', 'حلم', 'كابوس', 'رؤية', 'وهم', 'سحر', 'سحابة', 'قوس قزح', 'برق', 'رعد', 'ندى', 'غروب', 'شروق', 'شفق', 'فجر', 'ظهيرة', 'عتمة', 'صخرة', 'رمل', 'ذهب', 'فضة', 'حديد', 'نحاس', 'زجاج', 'خشب', 'حجر', 'معدن', 'بلاستيك', 'ورق', 'نار', 'جليد', 'بخار', 'هواء', 'تراب', 'ضباب', 'قارب', 'سفينة', 'طائرة', 'قطار', 'باص', 'دراجة', 'جريدة', 'مجلة', 'كتاب', 'قصة', 'رواية', 'شعر', 'فيلم', 'مسلسل', 'برنامج', 'وثائقي', 'كرتون', 'أغنية', 'لعبة', 'كرة قدم', 'سلة', 'تنس', 'سباق', 'منافسة', 'جائزة', 'كأس', 'ميدالية', 'فوز', 'خسارة', 'تعادل', 'مطبخ', 'فرن', 'ثلاجة', 'سكين', 'ملعقة', 'شوكة', 'طبق', 'كوب', 'صحن', 'ابريق', 'سكر', 'ملح', 'قهوة', 'شاي', 'حليب', 'عسل', 'زبادي', 'جبن', 'خبز', 'أرز', 'لحم', 'دجاج', 'سمك', 'سلطة', 'شوربة', 'حساء', 'مقبلات', 'حلوى', 'آيس كريم', 'مطعم', 'مقهى', 'فندق', 'سوق', 'متجر', 'مركز', 'حديقة', 'ملعب', 'مسبح', 'نادي', 'مكتبة', 'متحف', 'بنك', 'شركة', 'مصنع', 'مزرعة', 'ميناء', 'مطار', 'شارع', 'ميدان', 'جسر', 'نفق', 'إشارة', 'زحام', 'إصلاح', 'بناء', 'هدم', 'حفر', 'طلاء', 'تنظيف', 'حريق', 'فيضان', 'زلزال', 'عاصفة', 'جفاف', 'أمطار', 'إنقاذ', 'مساعدة', 'دعم', 'تبرع', 'عمل خير', 'تطوع', 'ابتسامة', 'دموع', 'عناق', 'قبلة', 'وداع', 'لقاء', 'مصافحة', 'ترحيب', 'احتفال', 'تهنئة', 'تعزية', 'اعتذار', 'نصيحة', 'توجيه', 'تعليم', 'تدريب', 'إرشاد', 'توجيه', 'استماع', 'حديث', 'نقاش', 'حوار', 'جدال', 'اتفاق', 'اختلاف', 'تنافس', 'تعاون', 'منافسة', 'تحالف', 'صراع', 'سلام', 'حرب', 'هدنة', 'عداوة', 'صداقة', 'حب', 'كراهية', 'غفران', 'ثأر', 'عدل', 'ظلم', 'إنصاف', 'قانون', 'شرطة', 'محكمة', 'قاضي', 'محامي', 'سجن', 'جريمة', 'سرقة', 'قتل', 'تحقيق', 'شهادة', 'براءة', 'حكومة', 'رئيس', 'وزير', 'برلمان', 'انتخاب', 'تصويت', 'بلد', 'وطن', 'مواطن', 'هجرة', 'لجوء', 'جنسية', 'لغة', 'كلمة', 'جملة', 'معنى', 'ترجمة', 'لهجة', 'ثقافة', 'تراث', 'عادات', 'تقاليد', 'فلكلور', 'طفل', 'امتحان', 'تأخر', 'نجاح', 'فشل', 'القيامة'];
    return commonKeywords.filter(keyword => text.includes(keyword));
  };
  const handleCopyToClipboard = () => {
    if (interpretation) {
      navigator.clipboard.writeText(interpretation);
      toast.success("تم نسخ التفسير إلى الحافظة");
    }
  };
  const handlePrint = () => {
    if (!interpretation) return;
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
          <div class="dream-content">${dreamText}</div>
          <h3>التفسير:</h3>
          <div class="interpretation">${interpretation}</div>
          <div class="disclaimer">
            <strong>تنبيه وإخلاء مسؤولية:</strong>
            تم تفسير هذا الحلم عبر تطبيق Taweel.app باستخدام خوارزميات الذكاء الاصطناعي لأغراض تعليمية ولا يُمكن اتخاذ أي قرارات حياتية بناءً عليه.
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated === null) {
      await checkAuth();
    }
    if (!isAuthenticated) {
      toast.error("يجب عليك تسجيل الدخول أولاً للاستفادة من خدمة تفسير الأحلام");
      navigate('/login');
      return;
    }
    if (hasReachedLimit) {
      toast.error("لقد استنفدت الحد المسموح به من التفسيرات. يرجى ترقية اشتراكك.");
      navigate('/pricing');
      return;
    }
    if (dreamText.trim()) {
      const currentWordCount = dreamText.trim().split(/\s+/).length;
      if (currentWordCount < 10) {
        toast.error("يجب أن يحتوي وصف الحلم على 10 كلمات على الأقل للحصول على تفسير دقيق");
        return;
      }
      if (interpretationSettings) {
        if (currentWordCount > interpretationSettings.max_input_words) {
          toast.error(`الرجاء تقليل عدد الكلمات. الحد الأقصى المسموح به هو ${interpretationSettings.max_input_words} كلمة.`);
          return;
        }
      }
      interpretDream(dreamText);
    }
  };
  const calculateWordPercentage = (): number => {
    if (!interpretationSettings || !wordCount) return 0;
    const percentage = wordCount / interpretationSettings.max_input_words * 100;
    return Math.min(percentage, 100);
  };
  const getProgressColor = (): string => {
    const percentage = calculateWordPercentage();
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };
  const renderAuthenticationStatus = () => {
    if (isAuthenticated === false) {
      return <div className="flex items-center justify-center gap-2 text-amber-500 mb-2">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">قم بتسجيل الدخول للاستفادة من خدمة تفسير الأحلام</span>
        </div>;
    }
    return null;
  };
  const renderAiSettingsStatus = () => {
    if (!error) return null;
    const isApiKeyIssue = error.includes('API') || error.includes('مفتاح') || error.includes('quota');
    if (isApiKeyIssue && isAuthenticated) {
      return <div className="text-xs text-amber-600 flex items-center justify-center mt-1">
          <Button variant="link" className="p-0 h-auto text-xs text-amber-600 underline" onClick={() => navigate('/admin')}>
            التحقق من إعدادات API في لوحة التحكم
          </Button>
        </div>;
    }
    return null;
  };
  const renderInterpretationLimitStatus = () => {
    if (!subscriptionUsage || !pricingSettings || !userSubscription) return null;
    const checkAndRenderLimitStatus = async () => {
      try {
        const totalAllowed = await getTotalInterpretations(userSubscription);
        if (totalAllowed === -1) {
          return <div className="text-sm text-muted-foreground text-center mb-2">
              <span>تفسيرات غير محدودة</span>
            </div>;
        }
        if (subscriptionUsage.interpretations_used >= totalAllowed) {
          return <div className="flex items-center justify-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">لقد استنفدت الحد المسموح به من التفسيرات. يرجى ترقية اشتراكك.</span>
            </div>;
        } else {
          return <div className="text-sm text-muted-foreground text-center mb-2">
              <span>
                التفسيرات المتبقية: {totalAllowed - subscriptionUsage.interpretations_used} من أصل {totalAllowed}
              </span>
            </div>;
        }
      } catch (error) {
        console.error("Error rendering limit status:", error);
        return null;
      }
    };
    const [renderedStatus, setRenderedStatus] = useState<React.ReactNode>(null);
    useEffect(() => {
      let isMounted = true;
      const updateRenderedStatus = async () => {
        const statusComponent = await checkAndRenderLimitStatus();
        if (isMounted) {
          setRenderedStatus(statusComponent);
        }
      };
      updateRenderedStatus();
      return () => {
        isMounted = false;
      };
    }, [subscriptionUsage, pricingSettings, userSubscription]);
    return renderedStatus;
  };
  return <div className="container mx-auto px-4 py-12 rtl">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-border/40 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-2 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-2xl font-bold text-primary">حلل حلمك الآن</CardTitle>
            <CardDescription className="text-muted-foreground/90">اكتب حلمك بلغة عربية فصيحة وباختصار لكي تحصل على تفسير تحليلي دقيق</CardDescription>
            {renderAuthenticationStatus()}
            {renderInterpretationLimitStatus()}
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Textarea id="dream-form-textarea" placeholder="اكتب حلمك هنا . . ." className="min-h-[150px] resize-none border-2 border-gray-100 focus:border-primary/20" value={dreamText} onChange={e => setDreamText(e.target.value)} required disabled={hasReachedLimit} />
                <div className="space-y-2">
                  {interpretationSettings && <>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div className="space-x-1">
                          <span>{wordCount}</span>
                          <span>/</span>
                          <span>{interpretationSettings.max_input_words}</span>
                          <span> كلمة</span>
                          {wordCount < 10 && <span className="text-amber-500 mr-2">(الحد الأدنى: 10 كلمات)</span>}
                        </div>
                        <div>
                          <span>{charCount}</span>
                          <span> حرف</span>
                        </div>
                      </div>
                      <Progress value={calculateWordPercentage()} className={`h-1 ${getProgressColor()}`} />
                    </>}
                </div>
              </div>
              <Button type="submit" className="w-full shadow-sm" disabled={isLoading || !dreamText.trim() || wordCount < 10 || interpretationSettings && wordCount > interpretationSettings.max_input_words || hasReachedLimit}>
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التفسير...
                  </> : hasReachedLimit ? 'قم بترقية اشتراكك للمتابعة' : 'فسّر الحلم'}
              </Button>
              {renderAiSettingsStatus()}
            </form>
          </CardContent>
          
          {error && <CardContent className="pt-0">
              <Alert variant="destructive">
                <AlertDescription>
                  <p><strong>حدث خطأ:</strong> {error}</p>
                  {error.includes('API') || error.includes('مفتاح') ? <p className="mt-2">يرجى التأكد من الإعدادات في لوحة التحكم وضبط مفتاح API لمزود الذكاء الاصطناعي.</p> : <p className="mt-2">يرجى المحاولة مرة أخرى أو الاتصال بمسؤول النظام للمساعدة.</p>}
                </AlertDescription>
              </Alert>
            </CardContent>}
          
          {interpretation && <CardFooter className="flex flex-col items-start border-t border-border/50 pt-6">
              <div className="w-full bg-white p-6 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">تفسير الحلم:</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      نسخ
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      طباعة
                    </Button>
                  </div>
                </div>
                
                <div className="whitespace-pre-line mb-6 
                               text-foreground/80 leading-relaxed tracking-wide 
                               selection:bg-primary/20 prose prose-sm max-w-none">
                  {renderBoldText(interpretation)}
                </div>
                
                <Alert className="mt-6 border-amber-200 bg-amber-50/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm mt-2">
                    <strong className="block mb-2">تنبيه وإخلاء مسؤولية:</strong>
                    تم تفسير هذا الحلم عبر تطبيق Taweel.app باستخدام خوارزميات الذكاء الاصطناعي لأغراض تعليمية ولا يُمكن اتخاذ أي قرارات حياتية بناءً عليه.
                  </AlertDescription>
                </Alert>
              </div>
            </CardFooter>}
        </Card>
      </div>
    </div>;
};
export default DreamForm;