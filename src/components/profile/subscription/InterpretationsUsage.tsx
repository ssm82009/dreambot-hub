import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { User } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface InterpretationsUsageProps {
  userData: User & {
    dreams_count: number;
  };
}

const InterpretationsUsage: React.FC<InterpretationsUsageProps> = ({ userData }) => {
  const [subscriptionUsage, setSubscriptionUsage] = useState<{
    interpretations_used: number;
    subscription_type: string;
    subscription_expires_at: string;
  } | null>(null);
  
  useEffect(() => {
    const fetchSubscriptionUsage = async () => {
      if (!userData?.id) {
        console.log("No user ID available");
        return;
      }
      
      try {
        console.log("Fetching subscription usage for user:", userData.id);
        const { data, error } = await supabase
          .rpc('get_current_subscription_usage', {
            user_id: userData.id
          });

        if (error) {
          console.error("Error fetching subscription usage:", error);
          return;
        }

        if (data && data[0]) {
          const usageData = data[0];
          console.log("Raw subscription usage data:", usageData);
          
          // التحقق من صلاحية الاشتراك مع دعم infinity
          const expiryDate = usageData.subscription_expires_at ? 
            usageData.subscription_expires_at === 'infinity' ? 
              null : new Date(usageData.subscription_expires_at) 
            : null;
            
          const isValid = !expiryDate || expiryDate > new Date();
          
          if (isValid) {
            console.log("Setting valid subscription usage data");
            setSubscriptionUsage(usageData);
          } else {
            console.log("Subscription data is expired, not updating state");
            setSubscriptionUsage(null);
          }
        } else {
          console.log("No subscription usage data found");
          setSubscriptionUsage(null);
        }
      } catch (error) {
        console.error("Error in subscription usage check:", error);
      }
    };

    fetchSubscriptionUsage();
    
    // Set up real-time subscription with proper error handling
    let channel;
    try {
      channel = supabase
        .channel('subscription-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscription_usage',
            filter: `user_id=eq.${userData.id}`
          },
          (payload) => {
            console.log("Received subscription update:", payload);
            fetchSubscriptionUsage();
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to subscription_usage changes");
          } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.error("Error in subscription channel, status:", status);
          }
        });
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
    }

    return () => {
      if (channel) {
        console.log("Cleaning up subscription channel");
        supabase.removeChannel(channel).then(
          () => console.log("Channel removed successfully"),
          (err) => console.error("Error removing channel:", err)
        );
      }
    };
  }, [userData?.id]);
  
  // Determine if the subscription is unlimited
  const isUnlimited = subscriptionUsage?.subscription_type === 'pro' || 
                     subscriptionUsage?.subscription_type === 'المميز' || 
                     subscriptionUsage?.subscription_type === 'premium' ||
                     subscriptionUsage?.subscription_type === 'الاحترافي';
  
  // Calculate total available interpretations based on subscription type
  const getTotalInterpretations = () => {
    if (!subscriptionUsage?.subscription_type) return 0;
    
    const subType = subscriptionUsage.subscription_type.toLowerCase();
    
    if (subType === 'premium' || subType === 'المميز' || 
        subType === 'pro' || subType === 'الاحترافي') {
      return -1; // Unlimited
    } else if (subType === 'free' || subType === 'مجاني') {
      return 3;
    } else {
      return 19; // Default for other subscription types
    }
  };
  
  const totalInterpretations = getTotalInterpretations();
  const usedInterpretations = subscriptionUsage?.interpretations_used || 0;
  const remainingInterpretations = isUnlimited ? -1 : Math.max(0, totalInterpretations - usedInterpretations);
  
  // Progress percentage
  const progressPercentage = isUnlimited ? 100 : Math.min(100, (usedInterpretations / totalInterpretations) * 100);
  
  // Debug logs
  console.log("Current subscription state:", {
    type: subscriptionUsage?.subscription_type,
    total: totalInterpretations,
    used: usedInterpretations,
    remaining: remainingInterpretations,
    isUnlimited,
    progress: progressPercentage,
    expiryDate: subscriptionUsage?.subscription_expires_at
  });
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">التفسيرات المستخدمة في الدورة الحالية:</span>
          <span className="font-medium">
            {isUnlimited ? 
              `${usedInterpretations} / غير محدود` : 
              `${usedInterpretations} / ${totalInterpretations}`}
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-between">
        <span className="text-muted-foreground">التفسيرات المتبقية:</span>
        <span className="font-medium">{isUnlimited ? 'غير محدود' : remainingInterpretations}</span>
      </div>
    </div>
  );
};

export default InterpretationsUsage;
