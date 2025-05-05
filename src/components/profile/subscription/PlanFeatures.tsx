
import React from 'react';
import { User } from '@/types/database';
import { getCurrentPlanFeatures } from '@/utils/subscription';

interface PlanFeaturesProps {
  userData: User & {
    dreams_count: number;
  } | null;
  pricingSettings: any;
}

const PlanFeatures: React.FC<PlanFeaturesProps> = ({ userData, pricingSettings }) => {
  if (!userData) {
    return (
      <div className="pt-4">
        <h4 className="font-medium mb-3">المميزات المتاحة:</h4>
        <div className="text-center p-2">
          <p className="text-muted-foreground">لم يتم العثور على بيانات المستخدم</p>
        </div>
      </div>
    );
  }
  
  const features = getCurrentPlanFeatures(userData, pricingSettings);
  
  return (
    <div className="pt-4">
      <h4 className="font-medium mb-3">المميزات المتاحة:</h4>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 ml-2">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlanFeatures;
