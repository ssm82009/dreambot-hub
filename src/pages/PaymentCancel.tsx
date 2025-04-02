
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    // إزالة بيانات الاشتراك المعلقة
    localStorage.removeItem('pendingSubscriptionPlan');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-red-300 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">تم إلغاء عملية الدفع</h1>
            <p className="mb-6 text-gray-600">
              لقد تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/pricing')}
              >
                العودة لصفحة الأسعار
              </Button>
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

export default PaymentCancel;
