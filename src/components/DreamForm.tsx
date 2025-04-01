import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DreamSymbol = Database['public']['Tables']['dream_symbols']['Row'];
type Dream = Database['public']['Tables']['dreams']['Row'];

const DreamForm = () => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dreamSymbols, setDreamSymbols] = useState<DreamSymbol[]>([]);

  useEffect(() => {
    fetchDreamSymbols();
  }, []);

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
      let generatedInterpretation = '';
      
      if (dreamSymbols.length > 0) {
        for (const symbol of dreamSymbols) {
          if (dream.includes(symbol.symbol)) {
            generatedInterpretation += symbol.interpretation + ' ';
          }
        }
      }
      
      if (!generatedInterpretation) {
        const responses = [
          "يشير هذا الحلم إلى تغييرات إيجابية في حياتك القادمة. الماء في المنام يدل على الحياة والخصوبة، وقد تمر بفترة من التجديد الروحي.",
          "هذا الحلم يعكس مخاوفك الداخلية وقلقك تجاه المستقبل. حاول أن تتعامل مع هذه المخاوف بشكل واعٍ في حياتك اليومية.",
          "الطيور في المنام تدل على الأخبار والرسائل. قد تتلقى قريباً خبراً ساراً أو فرصة جديدة في حياتك.",
          "السفر في المنام يرمز إلى التغيير في مسار حياتك. قد تكون على وشك اتخاذ قرار مهم أو الانتقال إلى مرحلة جديدة.",
          "الأشخاص الذين ظهروا في حلمك يمثلون جوانب من شخصيتك أو علاقاتك الحالية. فكر في صفاتهم وكيف تتعلق بحياتك."
        ];
        generatedInterpretation = responses[Math.floor(Math.random() * responses.length)];
      }
      
      const { error } = await supabase
        .from('dreams')
        .insert({
          dream_text: dream,
          interpretation: generatedInterpretation,
          user_id: null,
          tags: extractKeywords(dream)
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
      interpretDream(dreamText);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 rtl">
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
                  placeholder="صف حلمك بالتفصيل..."
                  className="min-h-[150px] resize-none"
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  required
                />
              </div>
              <div className="mt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !dreamText.trim()}
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
              <p className="text-foreground/80 leading-relaxed">{interpretation}</p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DreamForm;
