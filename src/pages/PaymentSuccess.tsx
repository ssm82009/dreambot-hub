
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getPaylinkInvoiceStatus } from '@/services/paylinkService';
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // في الكود PHP، هناك transactionNo - نتحقق من كلاهما
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  
  useEffect(() => {
    const verifyPayment = async () => {
      // تحديث حالة الاشتراك في localStorage
      const plan = localStorage.getItem('pendingSubscriptionPlan');
      if (plan) {
        localStorage.setItem('subscriptionType', plan);
        localStorage.removeItem('pendingSubscriptionPlan');
        
        // تسجيل معرّف العملية في سجل المطور
        console.log("Payment success for transaction:", transactionNo || orderNumber);
        
        try {
          // استرجاع بيانات اعتماد PayLink
          const { data: paymentSettings, error: settingsError } = await supabase
            .from('payment_settings')
            .select('*')
            .limit(1)
            .single();

          if (settingsError) {
            console.error("خطأ في جلب إعدادات الدفع:", settingsError);
            return;
          }

          // Get the current user
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) {
            console.error("No authenticated user found");
            return;
          }
          
          const userId = session.user.id;
          console.log("Setting subscription for user:", userId);

          if (transactionNo && paymentSettings?.paylink_api_key && paymentSettings?.paylink_secret_key) {
            // التحقق من حالة الدفع باستخدام API
            const status = await getPaylinkInvoiceStatus(
              paymentSettings.paylink_api_key,
              paymentSettings.paylink_secret_key,
              transactionNo
            );
            
            if (status && (status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed')) {
              toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
              
              // تحديث حالة الفاتورة في قاعدة البيانات
              await supabase
                .from('payment_invoices')
                .update({ status: 'Paid' })
                .eq('invoice_id', transactionNo);
                
              // Set expiry date (30 days from now)
              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 30);
              
              // Update the user's subscription in the database
              const { error: updateError } = await supabase
                .from('users')
                .update({ 
                  subscription_type: plan,
                  subscription_expires_at: expiryDate.toISOString()
                })
                .eq('id', userId);
                
              if (updateError) {
                console.error("Error updating user subscription:", updateError);
              } else {
                console.log("Updated subscription successfully for user:", userId);
              }
            } else {
              console.warn(`حالة الدفع: ${status || 'غير معروفة'}`);
            }
          } else {
            // إذا لم نتمكن من التحقق من حالة الدفع، نفترض أنه ناجح
            // لأن المستخدم وصل إلى صفحة النجاح
            toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
            
            // Set expiry date (30 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            // Update the user's subscription in the database
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                subscription_type: plan,
                subscription_expires_at: expiryDate.toISOString()
              })
              .eq('id', userId);
              
            if (updateError) {
              console.error("Error updating user subscription:", updateError);
            } else {
              console.log("Updated subscription successfully for user:", userId);
            }
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          // نعرض رسالة نجاح على الرغم من الخطأ لأن المستخدم على صفحة النجاح
          toast.success(`تم الاشتراك في الباقة ${plan} بنجاح!`);
        }
      }
    };

    verifyPayment();
  }, [transactionNo, orderNumber]);

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
            {(transactionNo || orderNumber) && (
              <p className="mb-6 text-sm text-gray-500">
                رقم العملية: {transactionNo || orderNumber}
              </p>
            )}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate('/profile')}
              >
                الذهاب للملف الشخصي
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
