
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { createPaylinkInvoice } from '@/services/paylink';
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ name: string, email: string } | null>(null);

  useEffect(() => {
    // Get user data if logged in
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user data from the users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
          
        if (userProfile) {
          setUserData({
            name: userProfile.full_name || user.email?.split('@')[0] || 'مستخدم',
            email: userProfile.email || user.email || ''
          });
        } else {
          setUserData({
            name: user.email?.split('@')[0] || 'مستخدم',
            email: user.email || ''
          });
        }
      }
    };
    
    getUserData();
  }, []);

  useEffect(() => {
    // Check that user arrived from pricing page
    if (!location.state || !location.state.plan) {
      navigate('/pricing');
      return;
    }

    // Set plan and amount based on the selected plan
    const selectedPlan = location.state.plan;
    setPlan(selectedPlan);
    
    // Fetch current pricing from database
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) {
          console.error("Error fetching pricing:", error);
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
          return;
        }
        
        // Set amount based on fetched pricing
        let priceAmount = 0;
        switch (selectedPlan) {
          case 'المجاني':
            priceAmount = data.free_plan_price || 0;
            break;
          case 'المميز':
            priceAmount = data.premium_plan_price || 49;
            break;
          case 'الاحترافي':
            priceAmount = data.pro_plan_price || 99;
            break;
          default:
            priceAmount = 0;
        }
        setAmount(priceAmount);
      } catch (error) {
        console.error("Error in pricing fetch:", error);
        // Fallback to default pricing
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
      }
    };
    
    fetchPricing();
  }, [location, navigate]);

  const handlePayment = async () => {
    // For free plan, just update subscription status
    if (amount === 0) {
      toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
      localStorage.setItem('subscriptionType', plan);
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    
    // For paid plans, process payment through PayLink.sa
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول لإتمام عملية الدفع');
        navigate('/login');
        return;
      }
      
      // Create invoice
      const invoice = await createPaylinkInvoice(
        amount,
        userData?.name || user.email?.split('@')[0] || 'مستخدم',
        userData?.email || user.email || '',
        plan
      );
      
      if (!invoice.success || !invoice.url) {
        toast.error(invoice.message || 'فشل إنشاء الفاتورة. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
        return;
      }
      
      // Store pending subscription plan in localStorage
      localStorage.setItem('pendingSubscriptionPlan', plan);
      
      // Redirect to PayLink payment page
      window.location.href = invoice.url;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('حدث خطأ أثناء معالجة الدفع');
      setIsLoading(false);
    }
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
                <span>PayLink.sa</span>
              </div>
              
              {amount > 0 && (
                <div className="mt-8">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      سيتم تحويلك إلى بوابة الدفع PayLink.sa لإتمام عملية الدفع بشكل آمن.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto flex items-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                العودة
              </Button>
              <Button 
                onClick={handlePayment}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  amount === 0 ? "اشترك مجانًا" : "إتمام الدفع"
                )}
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
