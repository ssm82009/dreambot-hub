
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
    <div className="relative overflow-hidden pt-16 pb-10 rtl"> {/* تقليل padding من pt-24 pb-16 إلى pt-16 pb-10 */}
      <div className="absolute inset-0 dream-pattern opacity-50 z-0"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="animate-float mb-4"> {/* تقليل mb من 8 إلى 4 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary"> {/* تقليل حجم الأيقونة من 120 إلى 100 */}
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              <circle cx="12" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="14" r="1" fill="currentColor" />
              <circle cx="16" cy="14" r="1" fill="currentColor" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">{title}</h1> {/* تقليل حجم الخط md من 6xl إلى 5xl وتقليل mb من 6 إلى 4 */}
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mb-6"> {/* تقليل حجم النص من xl/2xl إلى lg/xl وتقليل mb من 10 إلى 6 */}
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 rtl:space-x-reverse">
            <Button size="lg" className="text-lg px-8" onClick={handleStartNow}>ابدأ الآن</Button>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">اعرف المزيد</Button>
            </Link>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl"> {/* تقليل mt من 20 إلى 12 وتقليل gap من 8 إلى 4 */}
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border"> {/* تقليل padding من 6 إلى 4 */}
              <div className="mb-3 text-primary"> {/* تقليل mb من 4 إلى 3 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {/* تقليل حجم الأيقونة من 36 إلى 32 */}
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
              <h5 className="text-lg font-semibold mb-1">تفسير دقيق</h5> {/* تقليل حجم الخط من xl إلى lg وتقليل mb من 2 إلى 1 */}
              <p className="text-foreground/70">تفسيرات مبنية على أسس علمية وموثوقة من كتب التفسير المعتمدة.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border"> {/* تقليل padding من 6 إلى 4 */}
              <div className="mb-3 text-primary"> {/* تقليل mb من 4 إلى 3 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {/* تقليل حجم الأيقونة من 36 إلى 32 */}
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 10v8" />
                  <path d="M12 10v8" />
                  <path d="M16 10v8" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-1">استجابة فورية</h5> {/* تقليل حجم الخط من xl إلى lg وتقليل mb من 2 إلى 1 */}
              <p className="text-foreground/70">احصل على تفسير حلمك في ثوانٍ معدودة دون انتظار.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-md border border-border"> {/* تقليل padding من 6 إلى 4 */}
              <div className="mb-3 text-primary"> {/* تقليل mb من 4 إلى 3 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {/* تقليل حجم الأيقونة من 36 إلى 32 */}
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold mb-1">سهولة الاستخدام</h5> {/* تقليل حجم الخط من xl إلى lg وتقليل mb من 2 إلى 1 */}
              <p className="text-foreground/70">واجهة بسيطة وسهلة الاستخدام لجميع المستخدمين.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
