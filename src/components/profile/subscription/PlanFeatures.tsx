
import React from 'react';
import { User } from '@/types/database';
import { Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanFeaturesProps {
  userData: User | null;
  pricingSettings: any;
}

const PlanFeatures: React.FC<PlanFeaturesProps> = ({ userData, pricingSettings }) => {
  if (!userData || !pricingSettings) {
    return (
      <Alert>
        <AlertDescription>
          لم يتم العثور على بيانات الباقة
        </AlertDescription>
      </Alert>
    );
  }

  const getCurrentPlanFeatures = () => {
    if (!userData || !pricingSettings) return [];
    
    if (userData.subscription_type === 'pro' || 
        userData.subscription_type === 'الاحترافي') {
      return pricingSettings.pro_plan_features.split('\n').filter(Boolean);
    } else if (userData.subscription_type === 'premium' || 
              userData.subscription_type === 'المميز') {
      return pricingSettings.premium_plan_features.split('\n').filter(Boolean);
    } else {
      return pricingSettings.free_plan_features.split('\n').filter(Boolean);
    }
  };
  
  const features = getCurrentPlanFeatures();
  
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">مميزات الباقة</h3>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm">
            <Check className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanFeatures;
