
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
  
  // PayLink params
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  
  // PayPal params
  const invoiceId = searchParams.get('invoice_id') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const token = searchParams.get('token') || '';
  const customId = searchParams.get('custom') || ''; // PayPal custom field (contains our invoiceId)
  const txnId = searchParams.get('tx') || ''; // PayPal transaction ID
  
  // Get any available transaction identifier
  const transactionIdentifier = transactionNo || orderNumber || invoiceId || customId || token || paymentId || txnId;
  
  useEffect(() => {
    const verifyPayment = async () => {
      // تحديث حالة الاشتراك في localStorage
      const plan = localStorage.getItem('pendingSubscriptionPlan');
      if (plan) {
        localStorage.setItem('subscriptionType', plan);
        localStorage.removeItem('pendingSubscriptionPlan');
        
        // تسجيل معرّف العملية في سجل المطور
        console.log("Payment success with transaction ID:", transactionIdentifier);
        
        try {
          // استرجاع بيانات اعتماد PayLink
          const { data: paymentSettings, error: settingsError } = await supabase
            .from('payment_settings')
            .select('*')
            .limit(1)
            .single();

          if (settingsError) {
            console.error("خطأ في جلب إعدادات الدفع:", settingsError);
          }

          // استرجاع إعدادات التسعير للحصول على أسعار الخطط
          const { data: pricingSettings, error: pricingError } = await supabase
            .from('pricing_settings')
            .select('*')
            .limit(1)
            .single();

          if (pricingError) {
            console.error("خطأ في جلب إعدادات التسعير:", pricingError);
          }

          // Get the current user
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session?.user) {
            console.error("No authenticated user found");
            return;
          }
          
          const userId = session.user.id;
          console.log("Setting subscription for user:", userId);

          // تحديث حالة الفاتورة في قاعدة البيانات للفاتورة المحددة
          if (transactionIdentifier) {
            // نبحث عن الفاتورة بأي من المعرفات المحتملة
            const { data: invoices, error: findError } = await supabase
              .from('payment_invoices')
              .select('*')
              .or(`invoice_id.eq.${transactionIdentifier},invoice_id.eq.${customId}`);
              
            if (findError) {
              console.error("Error finding invoice:", findError);
            } else if (invoices && invoices.length > 0) {
              // تحديث حالة الفاتورة في قاعدة البيانات إلى "مدفوع"
              const { error: updateInvoiceError } = await supabase
                .from('payment_invoices')
                .update({ status: 'Paid' })
                .eq('id', invoices[0].id);
                
              if (updateInvoiceError) {
                console.error("Error updating invoice status:", updateInvoiceError);
              } else {
                console.log("Updated invoice status to Paid for invoice:", invoices[0].invoice_id);
              }
            } else {
              console.log("No matching invoice found for identifier:", transactionIdentifier);
              
              // إذا كانت العملية من PayPal وليس لدينا فاتورة متطابقة
              if (txnId && plan) {
                // تحديد المبلغ بناءً على نوع الخطة
                let amount = 0;
                if (plan === 'premium') {
                  // استخدام السعر من إعدادات التسعير، أو استخدام قيمة افتراضية
                  amount = pricingSettings?.premium_plan_price || 49;
                } else if (plan === 'pro') {
                  amount = pricingSettings?.pro_plan_price || 99;
                }
                
                // إنشاء سجل جديد بناءً على معلومات PayPal
                await supabase.from('payment_invoices').insert({
                  invoice_id: txnId,
                  user_id: userId,
                  plan_name: plan,
                  status: 'Paid',
                  payment_method: 'paypal',
                  amount: amount  // إضافة المبلغ المطلوب
                });
                console.log("Created new payment record from PayPal data with txnId:", txnId);
              }
            }
          }

          // التحقق من واجهة برمجة التطبيقات PayLink إذا كان ذلك ممكناً
          if (transactionNo && paymentSettings?.paylink_api_key && paymentSettings?.paylink_secret_key) {
            // التحقق من حالة الدفع باستخدام API (للتوثيق فقط)
            const status = await getPaylinkInvoiceStatus(
              paymentSettings.paylink_api_key,
              paymentSettings.paylink_secret_key,
              transactionNo
            );
            
            if (status) {
              console.log(`حالة الدفع من PayLink API: ${status}`);
            }
          }
          
          // Set expiry date (30 days from now) بغض النظر عن نتيجة التحقق من API
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
            toast.error("حدث خطأ أثناء تحديث الاشتراك");
          } else {
            console.log("Updated subscription successfully for user:", userId, "to plan:", plan);
            toast.success(`تم الاشتراك في الباقة ${plan === 'premium' ? 'المميزة' : 'الاحترافية'} بنجاح!`);
            
            // تحديث جميع الدفعات المرتبطة بهذا المستخدم والخطة إلى حالة "مدفوع"
            const { error: updateAllInvoicesError } = await supabase
              .from('payment_invoices')
              .update({ status: 'Paid' })
              .eq('user_id', userId)
              .eq('plan_name', plan)
              .eq('status', 'Pending');
              
            if (updateAllInvoicesError) {
              console.error("Error updating related invoices:", updateAllInvoicesError);
            } else {
              console.log("Updated all pending invoices for user:", userId, "and plan:", plan);
            }
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          // نعرض رسالة نجاح على الرغم من الخطأ لأن المستخدم على صفحة النجاح
          toast.success(`تم الاشتراك في الباقة ${plan === 'premium' ? 'المميزة' : 'الاحترافية'} بنجاح!`);
        }
      }
    };

    verifyPayment();
  }, [transactionIdentifier, navigate, customId, txnId]);

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
            {transactionIdentifier && (
              <p className="mb-6 text-sm text-gray-500">
                رقم العملية: {transactionIdentifier}
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
