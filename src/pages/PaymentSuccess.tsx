
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice_id');
  
  useEffect(() => {
    // تحديث حالة الاشتراك في localStorage
    const plan = localStorage.getItem('pendingSubscriptionPlan');
    if (plan) {
      localStorage.setItem('subscriptionType', plan);
      localStorage.removeItem('pendingSubscriptionPlan');
      
      // تسجيل معرّف الفاتورة في سجل المطور
      console.log("Payment success for invoice:", invoiceId);
      
      toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
    }
  }, [invoiceId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-green-600">تمت عملية الدفع بنجاح!</h1>
            <p className="mb-6 text-gray-600">
              شكراً لاشتراكك معنا. تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع مميزات الباقة.
            </p>
            {invoiceId && (
              <p className="mb-6 text-sm text-gray-500">
                رقم الفاتورة: {invoiceId}
              </p>
            )}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
