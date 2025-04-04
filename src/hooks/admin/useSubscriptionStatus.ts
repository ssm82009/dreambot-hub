
import { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionName } from '@/utils/subscription';
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';

type SubscriptionStatusResult = {
  displayName: string;
  statusColor: 'default' | 'secondary' | 'destructive' | 'outline';
  isActive: boolean;
  rawStatus: {
    name: string;
    color: 'default' | 'secondary' | 'destructive' | 'outline';
    isActive: boolean;
  }
};

export const useSubscriptionStatus = (user: User): SubscriptionStatusResult => {
  const [displayName, setDisplayName] = useState('');
  const subscriptionStatus = getSubscriptionStatus(user);
  
  useEffect(() => {
    // Fetch subscription name
    const loadSubscriptionName = async () => {
      try {
        const { data: settings } = await supabase
          .from('pricing_settings')
          .select('free_plan_name, premium_plan_name, pro_plan_name')
          .limit(1)
          .single();
        
        if (!settings) return;
        
        const name = await getSubscriptionName(user?.subscription_type, settings);
        setDisplayName(name);
      } catch (error) {
        console.error('Error loading subscription name:', error);
        
        // Fallback
        const normalizedType = normalizePlanType(user?.subscription_type || '');
        if (normalizedType === 'premium') {
          setDisplayName('الباقة المميزة');
        } else if (normalizedType === 'pro') {
          setDisplayName('الباقة الاحترافية');
        } else {
          setDisplayName('الباقة المجانية');
        }
      }
    };
    
    loadSubscriptionName();
  }, [user?.subscription_type]);

  return {
    displayName: displayName || subscriptionStatus.name,
    statusColor: subscriptionStatus.color,
    isActive: subscriptionStatus.isActive,
    rawStatus: subscriptionStatus
  };
};

// Add the missing import
import { normalizePlanType } from '@/utils/payment/statusNormalizer';
