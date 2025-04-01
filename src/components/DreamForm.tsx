
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DreamForm = () => {
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock interpretation function - in a real app, this would call an AI service
  const interpretDream = async (dream: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sample responses based on keywords
    const responses = [
      "يشير هذا الحلم إلى تغييرات إيجابية في حياتك القادمة. الماء في المنام يدل على الحياة والخصوبة، وقد تمر بفترة من التجديد الروحي.",
      "هذا الحلم يعكس مخاوفك الداخلية وقلقك تجاه المستقبل. حاول أن تتعامل مع هذه المخاوف بشكل واعٍ في حياتك اليومية.",
      "الطيور في المنام تدل على الأخبار والرسائل. قد تتلقى قريباً خبراً ساراً أو فرصة جديدة في حياتك.",
      "السفر في المنام يرمز إلى التغيير في مسار حياتك. قد تكون على وشك اتخاذ قرار مهم أو الانتقال إلى مرحلة جديدة.",
      "الأشخاص الذين ظهروا في حلمك يمثلون جوانب من شخصيتك أو علاقاتك الحالية. فكر في صفاتهم وكيف تتعلق بحياتك."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setInterpretation(randomResponse);
    setIsLoading(false);
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
