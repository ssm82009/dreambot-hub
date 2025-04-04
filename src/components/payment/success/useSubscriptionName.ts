
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getSubscriptionName } from '@/utils/subscription';

export const useSubscriptionName = (
  paymentSession: any,
  paymentData: any
) => {
  const [subscriptionName, setSubscriptionName] = useState('');

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      try {
        let planType = paymentSession?.plan_type;
        
        if (!planType) {
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

  return { subscriptionName };
};
