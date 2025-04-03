
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionName } from '@/utils/subscription';
import PaymentStatusBadge from '@/components/admin/transaction/PaymentStatusBadge';

interface PaymentSuccessContentProps {
  transactionIdentifier: string;
  isVerified?: boolean;
  isVerifying?: boolean;
  paymentData?: any;
  paymentSession?: any;
}

const PaymentSuccessContent = ({ 
  transactionIdentifier, 
  isVerified = false, 
  isVerifying = false,
  paymentData,
  paymentSession
}: PaymentSuccessContentProps) => {
  const navigate = useNavigate();
  const [subscriptionName, setSubscriptionName] = useState('');
  
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        // استرجاع نوع الاشتراك من جلسة الدفع أو من المستخدم الحالي
        let planType = paymentSession?.plan_type;
        
        if (!planType) {
          // الحصول على اشتراك المستخدم الحالي
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.id) {
            const { data: userData } = await supabase
              .from('users')
              .select('subscription_type')
              .eq('id', session.user.id)
              .single();
              
            if (userData?.subscription_type) {
              planType = userData.subscription_type;
            }
          }
        }
        
        if (!planType && paymentData?.plan_name) {
          planType = paymentData.plan_name;
        }
        
        // استرجاع اسم الاشتراك من إعدادات التسعير
        const { data: pricingSettings } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();
          
        const name = await getSubscriptionName(planType, pricingSettings);
        setSubscriptionName(name);
      } catch (error) {
        console.error('Error fetching subscription info:', error);
      }
    };
    
    fetchSubscriptionInfo();
  }, [paymentSession, paymentData]);
  
  // Always show payment data as "مدفوع" (paid) on the success page
  const displayPaymentData = paymentData ? {
    ...paymentData,
    status: 'مدفوع' // Always show as paid on success page
  } : null;
  
  // تحسين عرض اسم الباقة
  const getPlanDisplay = (planName: string) => {
    if (!planName) return '';
    
    const normalizedPlan = planName.toLowerCase();
    
    if (normalizedPlan.includes('premium') || normalizedPlan.includes('مميز')) {
      return 'المميزة';
    } else if (normalizedPlan.includes('pro') || normalizedPlan.includes('احترافي')) {
      return 'الاحترافية';
    } else {
      return planName;
    }
  };
  
  const getDislayPlan = () => {
    if (paymentSession?.plan_type) {
      return getPlanDisplay(paymentSession.plan_type);
    } else if (displayPaymentData?.plan_name) {
      return getPlanDisplay(displayPaymentData.plan_name);
    } else {
      return subscriptionName;
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500 text-center">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <h2 className="text-xl font-medium">جاري التحقق من عملية الدفع...</h2>
          </div>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-green-600">تمت عملية الدفع بنجاح!</h1>
            <p className="mb-6 text-gray-600">
              شكراً لاشتراكك معنا. تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع مميزات الباقة
              {getDislayPlan() && ` "${getDislayPlan()}"`}.
            </p>
            
            {displayPaymentData && (
              <div className="mb-6 border rounded-md p-4 bg-gray-50">
                <div className="text-sm text-right">
                  <div className="flex justify-between my-1">
                    <span className="font-medium">رقم العملية:</span>
                    <span>{displayPaymentData.invoice_id}</span>
                  </div>
                  <div className="flex justify-between my-1">
                    <span className="font-medium">الباقة:</span>
                    <span>{getPlanDisplay(displayPaymentData.plan_name)}</span>
                  </div>
                  <div className="flex justify-between my-1">
                    <span className="font-medium">المبلغ:</span>
                    <span>{displayPaymentData.amount} ريال</span>
                  </div>
                  <div className="flex justify-between my-1">
                    <span className="font-medium">الحالة:</span>
                    <PaymentStatusBadge status={'مدفوع'} />
                  </div>
                </div>
              </div>
            )}
            
            {transactionIdentifier && !displayPaymentData && (
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
            
            {isVerified && (
              <div className="mt-4 p-3 bg-green-50 rounded text-green-700 text-sm">
                تم التحقق من حالة الاشتراك وتفعيله بنجاح
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessContent;
