
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { usePageMeta } from '@/hooks/usePageMeta';

const NotFound = () => {
  const location = useLocation();
  
  // استخدام hooks مخصصة للموقع
  useScrollToTop();
  usePageMeta();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main 
        className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20 rtl" 
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
            <p className="text-7xl font-bold mb-6 gradient-text">عفواً</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground mb-6">
              الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها أو حذفها
            </p>
            
            <div className="dream-pattern p-6 rounded-xl shadow-md mb-8 border border-muted">
              <p className="text-lg italic">
                "في الرؤيا قد تضيع الطريق، لكن في اليقظة نهتدي إلى الصواب"
              </p>
            </div>
            
            <Button 
              size="lg" 
              className="gap-2" 
              onClick={() => window.location.href = '/'}
            >
              <Home size={18} />
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
