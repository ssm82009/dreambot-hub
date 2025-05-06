
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
interface HeroProps {
  title?: string;
  subtitle?: string;
}
const Hero: React.FC<HeroProps> = ({
  title = "فَسِّرْ حُلْمَكَ الآنَ!",
  subtitle = "~"
}) => {
  const navigate = useNavigate();

  // وظيفة للتمرير إلى قسم "جرب" مباشرة
  const handleStartNow = async () => {
    try {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session?.user) {
        // المستخدم مسجل الدخول، يمكن التمرير إلى قسم "جرب"
        const tryItSectionElement = document.getElementById('try-it');
        if (tryItSectionElement) {
          tryItSectionElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      } else {
        // المستخدم غير مسجل، توجيه إلى صفحة تسجيل الدخول
        // معرف توست فريد لتجنب التكرار
        const toastId = 'login-required-toast';
        
        // التحقق من وجود التوست قبل عرضه
        if (!document.querySelector(`[data-sonner-toast-id="${toastId}"]`)) {
          toast.info("يرجى تسجيل الدخول أولاً للاستفادة من خدمة تفسير الأحلام", {
            id: toastId
          });
        }
        
        navigate('/login');
      }
    } catch (error) {
      console.error("خطأ في التحقق من حالة تسجيل الدخول:", error);
      navigate('/login');
    }
  };
  return <div className="relative overflow-hidden pt-24 pb-10 rtl">
      <div className="absolute inset-0 dream-pattern opacity-50 z-0"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-float mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              <circle cx="12" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="14" r="1" fill="currentColor" />
              <circle cx="16" cy="14" r="1" fill="currentColor" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{title}</h1>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mb-6">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 rtl:space-x-reverse">
            <Button size="lg" className="text-lg px-8" onClick={handleStartNow}>ابدأ الآن</Button>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">اعرف المزيد</Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border">
              <div className="mb-3 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <h5 className="text-lg font-semibold mb-1">تفسير تحليلي</h5>
              <p className="text-foreground/70">تفسيرات نفسية تحليلية مبنية على علم النفس الاسلامي.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border">
              <div className="mb-3 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 10v8" />
                  <path d="M12 10v8" />
                  <path d="M16 10v8" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-1">استجابة فورية</h5>
              <p className="text-foreground/70">احصل على تحليل حلمك في ثوانٍ معدودة دون انتظار.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border">
              <div className="mb-3 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-1">سهولة الاستخدام</h5>
              <p className="text-foreground/70">واجهة بسيطة وسهلة الاستخدام لجميع المستخدمين.</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Hero;
