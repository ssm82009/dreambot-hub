
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment result parameters
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        
        if (!paymentId || !status) {
          toast.error('بيانات الدفع غير كاملة');
          setProcessing(false);
          setTimeout(() => navigate('/pricing'), 3000);
          return;
        }
        
        // Check if the user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('يجب تسجيل الدخول لإتمام عملية الدفع');
          setProcessing(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Record the transaction in the database
        if (status === 'paid' || status === 'completed') {
          // Get subscription details from local storage
          const plan = localStorage.getItem('pendingSubscriptionPlan');
          
          if (!plan) {
            toast.error('لم يتم العثور على تفاصيل الاشتراك');
            setProcessing(false);
            setTimeout(() => navigate('/pricing'), 3000);
            return;
          }
          
          // Update user's subscription in users table
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              subscription_type: plan,
              subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            })
            .eq('id', user.id);
            
          if (userUpdateError) {
            console.error('Error updating user subscription:', userUpdateError);
            toast.error('حدث خطأ أثناء تحديث بيانات الاشتراك');
            setProcessing(false);
            setTimeout(() => navigate('/pricing'), 3000);
            return;
          }
          
          // Update local storage
          localStorage.setItem('subscriptionType', plan);
          localStorage.removeItem('pendingSubscriptionPlan');
          
          toast.success('تم الاشتراك بنجاح!');
          setTimeout(() => navigate('/payment/success'), 1500);
        } else {
          toast.error('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
          setTimeout(() => navigate('/pricing'), 3000);
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        toast.error('حدث خطأ أثناء معالجة نتيجة الدفع');
      } finally {
        setProcessing(false);
      }
    };
    
    processPayment();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center p-8 max-w-md mx-auto rounded-lg border shadow-sm">
          <h1 className="text-2xl font-bold mb-4">معالجة الدفع</h1>
          {processing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>يرجى الانتظار بينما نتحقق من حالة الدفع الخاصة بك...</p>
            </div>
          ) : (
            <p>سيتم إعادة توجيهك...</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallback;
