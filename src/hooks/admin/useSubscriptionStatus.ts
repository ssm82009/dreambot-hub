
import { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionName } from '@/utils/subscription';

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

export const getSubscriptionStatus = (user: User) => {
  console.log("Getting subscription status for user:", user);
  
  // Check subscription type
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline' as const,
      isActive: false
    };
  }
  
  // Check if subscription has expiry date
  if (user.subscription_expires_at) {
    const expiryDate = new Date(user.subscription_expires_at);
    const now = new Date();
    
    console.log("Subscription expiry date:", expiryDate, "Current date:", now);
    
    // If expiry date is in the future, subscription is active
    if (expiryDate > now) {
      // Normalize the subscription type
      const normalizedType = normalizePlanType(user.subscription_type);
      
      // Map normalized plan type to badge color and simple display name
      let displayName = 'مميز';
      let badgeColor: 'default' | 'secondary' = 'secondary';
      
      if (normalizedType === 'pro') {
        displayName = 'احترافي';
        badgeColor = 'default';
      }
      
      return { 
        name: displayName,
        color: badgeColor,
        isActive: true
      };
    } else {
      // If expiry date is in the past, subscription has expired
      return { 
        name: 'منتهي', 
        color: 'destructive' as const,
        isActive: false
      };
    }
  }
  
  // If there's a subscription type but no expiry date, consider it active
  const normalizedType = normalizePlanType(user.subscription_type);
  
  // Map normalized plan type to badge color and simple display name
  let displayName = 'مميز';
  let badgeColor: 'default' | 'secondary' = 'secondary';
  
  if (normalizedType === 'pro') {
    displayName = 'احترافي';
    badgeColor = 'default';
  }
  
  return { 
    name: displayName,
    color: badgeColor,
    isActive: true
  };
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
