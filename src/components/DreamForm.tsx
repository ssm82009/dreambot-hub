import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DreamSymbol, InterpretationSettings } from '@/types/database';
import { Progress } from "@/components/ui/progress";

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

  useEffect(() => {
    fetchDreamSymbols();
    fetchSettings();
    checkAuth();
  }, []);

  useEffect(() => {
    setCharCount(dreamText.length);
    setWordCount(dreamText.trim() ? dreamText.trim().split(/\s+/).length : 0);
  }, [dreamText]);

  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        console.log("User authenticated:", data.session.user.id);
      } else {
        console.log("User not authenticated");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: aiData, error: aiError } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (aiError) {
        console.error("خطأ في جلب إعدادات الذكاء الاصطناعي:", aiError);
      } else {
        setAiSettings(aiData);
      }

      const { data: interpretationData, error: interpretationError } = await supabase
        .from('interpretation_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (interpretationError) {
        console.error("خطأ في جلب إعدادات التفسير:", interpretationError);
      } else {
        setInterpretationSettings(interpretationData);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بقاعدة البيانات:", error);
    }
  };

  const fetchDreamSymbols = async () => {
    try {
      const { data, error } = await supabase
        .from('dream_symbols')
        .select('*');
      
      if (error) {
        console.error("خطأ في جلب رموز الأحلام:", error);
      } else {
        setDreamSymbols(data || []);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بقاعدة البيانات:", error);
    }
  };

  const interpretDream = async (dream: string) => {
    setIsLoading(true);
    
    try {
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('interpret-dream', {
        body: { dreamText: dream }
      });

      if (aiError) {
        console.error("خطأ في استدعاء وظيفة تفسير الحلم:", aiError);
        toast.error("حدث خطأ أثناء تفسير الحلم، يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        return;
      }

      const generatedInterpretation = aiResponse?.interpretation || "لم نتمكن من الحصول على تفسير في هذا الوقت.";
      
      const extractedTags = extractKeywords(dream);
      console.log("Extracted tags:", extractedTags);
      
      const { error } = await supabase
        .from('dreams')
        .insert({
          dream_text: dream,
          interpretation: generatedInterpretation,
          user_id: userId,
          tags: extractedTags
        });
      
      if (error) {
        console.error("خطأ في حفظ الحلم:", error);
        toast.error("حدث خطأ عند حفظ الحلم، يرجى المحاولة مرة أخرى");
      } else {
        setInterpretation(generatedInterpretation);
        toast.success("تم حفظ الحلم بنجاح");
      }
    } catch (error) {
      console.error("خطأ في تفسير الحلم:", error);
      toast.error("حدث خطأ أثناء تفسير الحلم");
    } finally {
      setIsLoading(false);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const commonKeywords = [
      'ماء', 'طيران', 'سقوط', 'موت', 'مطاردة', 'سفر',
      'بيت', 'أسنان', 'فقدان', 'قطة', 'كلب', 'ثعبان',
      'طفل', 'امتحان', 'تأخر', 'نجاح', 'فشل', 'زواج'
    ];
    
    return commonKeywords.filter(keyword => text.includes(keyword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dreamText.trim()) {
      if (interpretationSettings) {
        const wordCount = dreamText.trim().split(/\s+/).length;
        if (wordCount > interpretationSettings.max_input_words) {
          toast.error(`الرجاء تقليل عدد الكلمات. الحد الأقصى المسموح به هو ${interpretationSettings.max_input_words} كلمة.`);
          return;
        }
      }
      interpretDream(dreamText);
    }
  };

  const calculateWordPercentage = (): number => {
    if (!interpretationSettings || !wordCount) return 0;
    const percentage = (wordCount / interpretationSettings.max_input_words) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (): string => {
    const percentage = calculateWordPercentage();
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-12 rtl" id="dream-form-section">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">فسّر حلمك الآن</CardTitle>
            <CardDescription>
              اكتب تفاصيل حلمك بدقة للحصول على تفسير أكثر دقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Textarea
                  id="dream-form-textarea"
                  placeholder="صف حلمك بالتفصيل..."
                  className="min-h-[150px] resize-none"
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  required
                />
                <div className="space-y-2">
                  {interpretationSettings && (
                    <>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>
                          <span>{wordCount}</span>
                          <span> / </span>
                          <span>{interpretationSettings.max_input_words}</span>
                          <span> كلمة</span>
                        </div>
                        <div>
                          <span>{charCount}</span>
                          <span> حرف</span>
                        </div>
                      </div>
                      <Progress 
                        value={calculateWordPercentage()} 
                        className={`h-1 ${getProgressColor()}`} 
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !dreamText.trim() || (interpretationSettings && wordCount > interpretationSettings.max_input_words)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التفسير...
                    </>
                  ) : (
                    'فسّر الحلم'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          {interpretation && (
            <CardFooter className="flex flex-col items-start border-t border-border/50 pt-6">
              <h3 className="text-lg font-semibold mb-2">تفسير الحلم:</h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{interpretation}</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DreamForm;
