
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';

interface UpgradeSectionProps {
  userData: User & {
    dreams_count: number;
  } | null;
}

const UpgradeSection: React.FC<UpgradeSectionProps> = ({ userData }) => {
  const navigate = useNavigate();
  const subscriptionStatus = getSubscriptionStatus(userData);
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };
  
  // Always show upgrade button if userData is null
  if (!userData) {
    return (
      <div className="pt-4">
        <div className="bg-primary/10 p-4 rounded-md mb-4">
          <p className="text-sm">
            قم بترقية اشتراكك للحصول على مزيد من التفسيرات والمميزات الإضافية.
          </p>
        </div>
        
        <Button onClick={handleUpgrade} className="w-full">
          ترقية الاشتراك
        </Button>
      </div>
    );
  }
  
  // Only show upgrade section for free or inactive subscriptions
  if (subscriptionStatus.isActive && userData?.subscription_type !== 'free') {
    return null;
  }
  
  return (
    <div className="pt-4">
      <div className="bg-primary/10 p-4 rounded-md mb-4">
        <p className="text-sm">
          قم بترقية اشتراكك للحصول على مزيد من التفسيرات والمميزات الإضافية.
        </p>
      </div>
      
      <Button onClick={handleUpgrade} className="w-full">
        ترقية الاشتراك
      </Button>
    </div>
  );
};

export default UpgradeSection;
