
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { User } from '@/types/database';
import { getTotalInterpretations } from '@/utils/subscription';
import { supabase } from '@/integrations/supabase/client';

interface InterpretationsUsageProps {
  userData: User & {
    dreams_count: number;
  };
  pricingSettings: any;
}

const InterpretationsUsage: React.FC<InterpretationsUsageProps> = ({ 
  userData, 
  pricingSettings
}) => {
  const [subscriptionUsage, setSubscriptionUsage] = useState<{
    interpretations_used: number;
  } | null>(null);
  
  useEffect(() => {
    const fetchSubscriptionUsage = async () => {
      if (!userData?.id) return;
      
      try {
        const { data, error } = await supabase
          .rpc('get_current_subscription_usage', {
            user_id: userData.id
          });

        if (error) {
          console.error("Error fetching subscription usage:", error);
          return;
        }

        if (data && data[0]) {
          console.log("Subscription usage data:", data[0]);
          setSubscriptionUsage(data[0]);
        } else {
          console.log("No subscription usage data found");
        }
      } catch (error) {
        console.error("Error in subscription usage check:", error);
      }
    };

    fetchSubscriptionUsage();
  }, [userData?.id]);
  
  const totalInterpretations = getTotalInterpretations(userData, pricingSettings);
  const usedInterpretations = subscriptionUsage?.interpretations_used || 0;
  
  // If total is -1, it means unlimited
  const isUnlimited = totalInterpretations === -1;
  
  // Remaining interpretations
  const remainingInterpretations = isUnlimited ? -1 : Math.max(0, totalInterpretations - usedInterpretations);
  
  // Progress percentage
  const progressPercentage = isUnlimited ? 100 : Math.min(100, (usedInterpretations / totalInterpretations) * 100);
  
  // Debug logs
  console.log("Total interpretations:", totalInterpretations);
  console.log("Used interpretations:", usedInterpretations);
  console.log("Remaining interpretations:", remainingInterpretations);
  console.log("Progress percentage:", progressPercentage);
  
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
