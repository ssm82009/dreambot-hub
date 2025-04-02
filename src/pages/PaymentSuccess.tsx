
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const subscriptionType = localStorage.getItem('subscriptionType');
  
  useEffect(() => {
    // Redirect to home if no subscription found
    if (!subscriptionType) {
      navigate('/');
    }
  }, [subscriptionType, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 rtl">
        <div className="text-center p-8 max-w-md mx-auto rounded-lg border shadow-sm">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">تم الاشتراك بنجاح!</h1>
          <p className="mb-6">
            تهانينا! لقد اشتركت بنجاح في باقة {subscriptionType}. يمكنك الآن الاستمتاع بجميع المميزات المتاحة في هذه الباقة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')}>
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
