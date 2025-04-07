
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Stars, SunMoon } from 'lucide-react';

interface HeroProps {
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "فَسِّرْ حُلْمَكَ الآنَ!",
  subtitle = "~"
}) => {
  const navigate = useNavigate();
  
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

  return (
    <div className="relative overflow-hidden pt-24 pb-16 rtl min-h-[85vh] flex items-center">
      <div className="absolute inset-0 dream-pattern opacity-50 z-0"></div>
      
      {/* تأثيرات الخلفية المتحركة */}
      <div className="absolute top-20 left-10 text-primary/20 animate-float" style={{animationDelay: '0.5s'}}>
        <Moon size={120} strokeWidth={1} />
      </div>
      <div className="absolute bottom-20 right-12 text-primary/30 animate-float" style={{animationDelay: '1.5s'}}>
        <Stars size={80} strokeWidth={1} />
      </div>
      <div className="absolute top-40 right-20 text-accent/20 animate-float" style={{animationDelay: '2s'}}>
        <SunMoon size={100} strokeWidth={1} />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-float mb-8">
            <SunMoon className="text-primary h-28 w-28 animate-pulse-glow" strokeWidth={1} />
          </div>
          
          <h1 className="title-font text-5xl md:text-7xl font-bold mb-6 gradient-text">{title}</h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mb-10 font-tajawal">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 rtl:space-x-reverse">
            <Button size="lg" className="text-lg px-8 btn-shine shadow-glow" onClick={handleStartNow}>
              ابدأ الآن
            </Button>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 hover:shadow-glow-lg transition-shadow">
                اعرف المزيد
              </Button>
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            <div className="glass-card p-6 rounded-lg shadow-subtle card-hover">
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
              <h5 className="text-xl font-semibold mb-2">تفسير دقيق</h5>
              <p className="text-foreground/70">تفسيرات مبنية على أسس علمية وموثوقة من كتب التفسير المعتمدة.</p>
            </div>
            
            <div className="glass-card p-6 rounded-lg shadow-subtle card-hover">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 10v8" />
                  <path d="M12 10v8" />
                  <path d="M16 10v8" />
                </svg>
              </div>
              <h5 className="text-xl font-semibold mb-2">استجابة فورية</h5>
              <p className="text-foreground/70">احصل على تفسير حلمك في ثوانٍ معدودة دون انتظار.</p>
            </div>
            
            <div className="glass-card p-6 rounded-lg shadow-subtle card-hover">
              <div className="mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h5 className="text-xl font-semibold mb-2">سهولة الاستخدام</h5>
              <p className="text-foreground/70">واجهة بسيطة وسهلة الاستخدام لجميع المستخدمين.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
