
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true' || 
                        localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
  }, []);

  const handleSubscription = (plan: string) => {
    if (!isLoggedIn) {
      // إذا لم يكن المستخدم مسجل الدخول، توجيهه إلى صفحة التسجيل
      navigate('/register');
    } else {
      // إذا كان المستخدم مسجل الدخول، توجيهه مباشرة إلى صفحة الدفع (يمكن تنفيذها لاحقاً)
      // مؤقتاً سنعرض رسالة توست
      toast.info(`سيتم توجيهك إلى صفحة الدفع للاشتراك في الباقة ${plan}`);
      // يمكن تنفيذ الانتقال إلى صفحة الدفع لاحقًا عندما تكون جاهزة
      // navigate('/payment', { state: { plan } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 gradient-text">خطط الاشتراك والأسعار</h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              اختر الخطة المناسبة لاحتياجاتك واستمتع بخدمة تفسير الأحلام المتقدمة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-border/50 shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">المجاني</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">0</span>
                  <span className="text-foreground/70 mr-1">ريال</span>
                </div>
                <CardDescription>للاستخدام الأساسي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">3 تفسيرات أحلام شهرياً</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">تفسير أساسي للأحلام</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">دعم عبر البريد الإلكتروني</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubscription('المجاني')}
                >
                  ابدأ مجاناً
                </Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className="border-2 border-primary relative shadow-lg">
              <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                الأكثر شعبية
              </div>
              <CardHeader className="text-center pb-8 pt-10">
                <CardTitle className="text-2xl font-bold">المميز</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">49</span>
                  <span className="text-foreground/70 mr-1">ريال</span>
                  <span className="text-foreground/50 text-sm">/شهرياً</span>
                </div>
                <CardDescription>للمستخدمين النشطين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">تفسيرات أحلام غير محدودة</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">تفسيرات مفصلة ومعمقة</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">أرشيف لتفسيرات أحلامك السابقة</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">نصائح وتوجيهات شخصية</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">دعم فني على مدار الساعة</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleSubscription('المميز')}
                >
                  اشترك الآن
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border-2 border-border/50 shadow-lg">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">الاحترافي</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">99</span>
                  <span className="text-foreground/70 mr-1">ريال</span>
                  <span className="text-foreground/50 text-sm">/شهرياً</span>
                </div>
                <CardDescription>للمؤسسات والمحترفين</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">كل مميزات الخطة المميزة</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">استشارات شخصية مع خبراء تفسير الأحلام</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">تقارير تحليلية شهرية</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">إمكانية إضافة 5 حسابات فرعية</p>
                </div>
                <div className="flex items-start">
                  <Check className="text-primary h-5 w-5 ml-2 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/80">واجهة برمجة التطبيقات API</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubscription('الاحترافي')}
                >
                  اشترك الآن
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h2>
            <div className="max-w-3xl mx-auto grid gap-6">
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border rtl">
                <h3 className="text-lg font-semibold mb-2">هل يمكنني إلغاء اشتراكي في أي وقت؟</h3>
                <p className="text-foreground/80">نعم، يمكنك إلغاء اشتراكك في أي وقت. ستستمر خدمتك حتى نهاية فترة الفوترة الحالية.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border rtl">
                <h3 className="text-lg font-semibold mb-2">ما هي طرق الدفع المتاحة؟</h3>
                <p className="text-foreground/80">نقبل بطاقات الائتمان والخصم المباشر وأنظمة الدفع الإلكترونية مثل PayPal وApple Pay.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border rtl">
                <h3 className="text-lg font-semibold mb-2">هل تقدمون ضمان استرداد المال؟</h3>
                <p className="text-foreground/80">نعم، نقدم ضمان استرداد المال لمدة 14 يومًا إذا لم تكن راضيًا عن الخدمة.</p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border rtl">
                <h3 className="text-lg font-semibold mb-2">هل التفسيرات دقيقة؟</h3>
                <p className="text-foreground/80">تستند تفسيراتنا إلى مصادر موثوقة ومعتمدة، ولكن من المهم أن تتذكر أن تفسير الأحلام ليس علمًا دقيقًا وقد يختلف من شخص لآخر.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
