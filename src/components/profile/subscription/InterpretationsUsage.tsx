
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { User } from '@/types/database';
import { getTotalInterpretations } from '@/utils/subscription';

interface InterpretationsUsageProps {
  userData: User & {
    dreams_count: number;
  };
  pricingSettings: any;
  usedInterpretations: number;
}

const InterpretationsUsage: React.FC<InterpretationsUsageProps> = ({ 
  userData, 
  pricingSettings, 
  usedInterpretations 
}) => {
  const totalInterpretations = getTotalInterpretations(userData, pricingSettings);
  
  // If total is -1, it means unlimited
  const isUnlimited = totalInterpretations === -1;
  
  // Remaining interpretations
  const remainingInterpretations = isUnlimited ? -1 : Math.max(0, totalInterpretations - usedInterpretations);
  
  // Progress percentage
  const progressPercentage = isUnlimited ? 100 : Math.min(100, (usedInterpretations / totalInterpretations) * 100);
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground">التفسيرات المستخدمة:</span>
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
