
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionName } from '@/utils/subscription';

interface PaymentSuccessContentProps {
  transactionIdentifier: string;
  isVerified?: boolean;
}

const PaymentSuccessContent = ({ transactionIdentifier, isVerified = false }: PaymentSuccessContentProps) => {
  const navigate = useNavigate();
  const [subscriptionName, setSubscriptionName] = useState('');
  
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        // استرجاع نوع الاشتراك من localStorage
        const planType = localStorage.getItem('subscriptionType');
        
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
  }, []);
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-green-500 text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-green-600">تمت عملية الدفع بنجاح!</h1>
        <p className="mb-6 text-gray-600">
          شكراً لاشتراكك معنا. تم تفعيل حسابك بنجاح ويمكنك الآن الاستمتاع بجميع مميزات الباقة
          {subscriptionName && ` "${subscriptionName}"`}.
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
        
        {isVerified && (
          <div className="mt-4 p-3 bg-green-50 rounded text-green-700 text-sm">
            تم التحقق من حالة الاشتراك وتفعيله بنجاح
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessContent;
