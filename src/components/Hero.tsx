
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/admin";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "تفسير الأحلام بالذكاء الاصطناعي",
  subtitle = "فسّر أحلامك بدقة عالية باستخدام أحدث تقنيات الذكاء الاصطناعي واستنادًا إلى مراجع التفسير الإسلامية الموثوقة."
}) => {
  const navigate = useNavigate();
  const { seoSettingsForm } = useAdmin();
  
  // وظيفة للتمرير إلى قسم كتابة الحلم مع التحقق من تسجيل الدخول
  const handleStartNow = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        // المستخدم مسجل الدخول، يمكن التمرير إلى قسم كتابة الحلم
        const dreamSectionElement = document.getElementById('dream-form-section');
        if (dreamSectionElement) {
          dreamSectionElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // المستخدم غير مسجل، توجيه إلى صفحة تسجيل الدخول
        toast.info("يرجى تسجيل الدخول أولاً للاستفادة من خدمة تفسير الأحلام");
        navigate('/login');
      }
    } catch (error) {
      console.error("خطأ في التحقق من حالة تسجيل الدخول:", error);
      navigate('/login');
    }
  };

  // Use SEO title if available, fallback to the provided title prop
  const displayTitle = seoSettingsForm?.metaTitle || title;

  return (
    <div className="relative overflow-hidden pt-24 pb-16 rtl">
      <div className="absolute inset-0 dream-pattern opacity-50 z-0"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-float mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              <circle cx="12" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="14" r="1" fill="currentColor" />
              <circle cx="16" cy="14" r="1" fill="currentColor" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">{displayTitle}</h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mb-10">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 rtl:space-x-reverse">
            <Button size="lg" className="text-lg px-8" onClick={handleStartNow}>ابدأ الآن</Button>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">اعرف المزيد</Button>
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-border">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h.01" />
                  <path d="M12 7h.01" />
                  <path d="M17 7h.01" />
                  <path d="M7 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M17 12h.01" />
                  <path d="M7 17h.01" />
                  <path d="M12 17h.01" />
                  <path d="M17 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">تفسير دقيق</h3>
              <p className="text-foreground/70">تفسيرات مبنية على أسس علمية وموثوقة من كتب التفسير المعتمدة.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-border">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 10v8" />
                  <path d="M12 10v8" />
                  <path d="M16 10v8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">استجابة فورية</h3>
              <p className="text-foreground/70">احصل على تفسير حلمك في ثوانٍ معدودة دون انتظار.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-border">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">سهولة الاستخدام</h3>
              <p className="text-foreground/70">واجهة بسيطة وسهلة الاستخدام لجميع المستخدمين.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
