
import React from 'react';
import { User } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UpgradeSectionProps {
  userData: User | null;
}

const UpgradeSection: React.FC<UpgradeSectionProps> = ({ userData }) => {
  const navigate = useNavigate();
  
  if (!userData) {
    return (
      <Alert>
        <AlertDescription>
          لم يتم العثور على بيانات المستخدم
        </AlertDescription>
      </Alert>
    );
  }

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };
  
  // Only show upgrade button for free users or users with expired subscriptions
  const showUpgradeButton = 
    !userData.subscription_type || 
    userData.subscription_type === 'free' ||
    (userData.subscription_expires_at && new Date(userData.subscription_expires_at) < new Date());
  
  if (!showUpgradeButton) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <Button 
        onClick={handleUpgradeClick} 
        className="w-full"
      >
        <Sparkles className="h-4 w-4 ml-2" />
        ترقية الاشتراك
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        قم بترقية اشتراكك للحصول على المزيد من التفسيرات والمميزات الإضافية
      </p>
    </div>
  );
};

export default UpgradeSection;
