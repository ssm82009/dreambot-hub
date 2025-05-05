
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { User } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { getTotalInterpretations } from '@/utils/subscription';

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
  const [totalInterpretations, setTotalInterpretations] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) {
        console.log("No user ID available");
        return;
      }
      
      try {
        // Fetch total available interpretations
        const total = await getTotalInterpretations(userData);
        setTotalInterpretations(total);
        
        // Fetch subscription usage
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
          
          let isValid = true;
          
          if (usageData.subscription_expires_at && usageData.subscription_expires_at !== 'infinity') {
            const expiryDate = new Date(usageData.subscription_expires_at);
            isValid = expiryDate > new Date();
          }
          
          if (isValid) {
            console.log("Setting valid subscription usage data");
            setSubscriptionUsage(usageData);
          } else {
            console.log("Subscription data is expired, not updating state");
            setSubscriptionUsage(null);
          }
        }
      } catch (error) {
        console.error("Error in subscription usage check:", error);
      }
    };

    fetchData();
    
    // Set up real-time subscription
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
          () => {
            fetchData();
          }
        )
        .subscribe();
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
    }

    return () => {
      if (channel) {
        console.log("Cleaning up subscription channel");
        supabase.removeChannel(channel);
      }
    };
  }, [userData?.id]);
  
  const usedInterpretations = subscriptionUsage?.interpretations_used || 0;
  const remainingInterpretations = Math.max(0, totalInterpretations - usedInterpretations);
  
  // Progress percentage
  const progressPercentage = Math.min(100, (usedInterpretations / totalInterpretations) * 100);
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">التفسيرات المستخدمة في الدورة الحالية:</span>
          <span className="font-medium">
            {`${usedInterpretations} / ${totalInterpretations}`}
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-between">
        <span className="text-muted-foreground">التفسيرات المتبقية:</span>
        <span className="font-medium">{remainingInterpretations}</span>
      </div>
    </div>
  );
};

export default InterpretationsUsage;
