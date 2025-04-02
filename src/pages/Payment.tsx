
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from "sonner";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // التحقق من أن المستخدم وصل للصفحة عن طريق صفحة الأسعار
    if (!location.state || !location.state.plan) {
      navigate('/pricing');
      return;
    }

    // تعيين الخطة والمبلغ بناءً على الباقة المختارة
    const selectedPlan = location.state.plan;
    setPlan(selectedPlan);
    
    let priceAmount = 0;
    switch (selectedPlan) {
      case 'المجاني':
        priceAmount = 0;
        break;
      case 'المميز':
        priceAmount = 49;
        break;
      case 'الاحترافي':
        priceAmount = 99;
        break;
      default:
        priceAmount = 0;
    }
    setAmount(priceAmount);
  }, [location, navigate]);

  const handlePayment = () => {
    // هنا ستكون الإجراءات الخاصة بعملية الدفع الفعلية (مثل التكامل مع بوابة دفع)
    // حاليًا سنستخدم توست لمحاكاة عملية الدفع
    toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
    
    // تحديث حالة الاشتراك في localStorage (هذا مؤقت، في التطبيق الحقيقي سيكون في قاعدة البيانات)
    localStorage.setItem('subscriptionType', plan);
    
    // التوجيه إلى الصفحة الرئيسية بعد الدفع
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4 gradient-text">إتمام عملية الدفع</h1>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              أنت على وشك الاشتراك في الباقة {plan}
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto border-2 border-primary/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">تفاصيل الدفع</CardTitle>
              <CardDescription>يرجى مراجعة تفاصيل اشتراكك قبل المتابعة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">نوع الباقة:</span>
                <span>{plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">المبلغ:</span>
                <span>{amount} ريال {amount > 0 ? "/ شهرياً" : ""}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">طريقة الدفع:</span>
                <span>بطاقة ائتمان</span>
              </div>
              
              {/* نموذج بيانات الدفع */}
              {amount > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5" />
                      <h3 className="font-medium">معلومات بطاقة الدفع</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">هذا نموذج توضيحي فقط. في التطبيق الفعلي سيتم التكامل مع بوابة دفع آمنة.</p>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="card-number" className="text-sm">رقم البطاقة</label>
                        <input 
                          id="card-number"
                          type="text" 
                          placeholder="0000 0000 0000 0000" 
                          className="border rounded-md p-2 w-full bg-background"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label htmlFor="expiry" className="text-sm">تاريخ الانتهاء</label>
                          <input 
                            id="expiry"
                            type="text" 
                            placeholder="MM/YY" 
                            className="border rounded-md p-2 w-full bg-background"
                            maxLength={5}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label htmlFor="cvc" className="text-sm">رمز الأمان CVC</label>
                          <input 
                            id="cvc"
                            type="text" 
                            placeholder="123" 
                            className="border rounded-md p-2 w-full bg-background"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
              <Button 
                onClick={handlePayment}
                className="w-full sm:w-auto"
                disabled={amount === 0}
              >
                {amount === 0 ? "اشترك مجانًا" : "إتمام الدفع"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
