
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFaqItems: FAQItem[] = [
  {
    question: 'هل يمكنني إلغاء اشتراكي في أي وقت؟',
    answer: 'نعم، يمكنك إلغاء اشتراكك في أي وقت. ستستمر خدمتك حتى نهاية فترة الفوترة الحالية.'
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نقبل بطاقات الائتمان والخصم المباشر وأنظمة الدفع الإلكترونية مثل PayPal وApple Pay.'
  },
  {
    question: 'هل تقدمون ضمان استرداد المال؟',
    answer: 'نعم، نقدم ضمان استرداد المال لمدة 14 يومًا إذا لم تكن راضيًا عن الخدمة.'
  },
  {
    question: 'هل التفسيرات دقيقة؟',
    answer: 'تستند تفسيراتنا إلى مصادر موثوقة ومعتمدة، ولكن من المهم أن تتذكر أن تفسير الأحلام ليس علمًا دقيقًا وقد يختلف من شخص لآخر.'
  }
];

const PricingFAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>(defaultFaqItems);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        // Check if there's a custom_pages table entry for FAQs
        const { data, error } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('slug', 'faq')
          .maybeSingle();

        if (error) {
          console.error("خطأ في جلب الأسئلة الشائعة:", error);
          setLoading(false);
          return;
        }

        // If we have a custom FAQ page, try to parse its content as JSON
        if (data && data.content) {
          try {
            const customFaqs = JSON.parse(data.content);
            if (Array.isArray(customFaqs) && customFaqs.length > 0) {
              setFaqItems(customFaqs);
            }
          } catch (parseError) {
            console.error("خطأ في تحليل محتوى الأسئلة الشائعة:", parseError);
          }
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return (
    <div className="mt-16 text-center">
      <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
      <div className="max-w-3xl mx-auto grid gap-6">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-background rounded-lg p-6 shadow-sm border border-border rtl">
            <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
            <p className="text-foreground/80">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingFAQ;
