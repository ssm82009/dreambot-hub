
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/database';
import { normalizePlanType } from '@/utils/payment/statusNormalizer';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionStatus = {
  name: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  isActive: boolean;
};

type SubscriptionBadgeProps = {
  user: User;
};

export const getSubscriptionStatus = (user: User): SubscriptionStatus => {
  console.log("Getting subscription status for user:", user);
  
  // Check subscription type
  if (!user.subscription_type || user.subscription_type === 'free') {
    return { 
      name: 'مجاني', 
      color: 'outline',
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
        color: 'destructive',
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

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ user }) => {
  const [planNames, setPlanNames] = useState<Record<string, string>>({});
  const subscriptionStatus = getSubscriptionStatus(user);
  
  useEffect(() => {
    // Fetch current plan names from pricing settings
    const fetchPlanNames = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('free_plan_name, premium_plan_name, pro_plan_name')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPlanNames({
            free: data.free_plan_name,
            premium: data.premium_plan_name,
            pro: data.pro_plan_name
          });
        }
      } catch (error) {
        console.error('Error fetching plan names:', error);
      }
    };
    
    fetchPlanNames();
  }, []);

  // For the badge, we continue using the simplified status names since they're better for UI
  return (
    <Badge variant={subscriptionStatus.color}>
      {subscriptionStatus.name}
    </Badge>
  );
};

export default SubscriptionBadge;
