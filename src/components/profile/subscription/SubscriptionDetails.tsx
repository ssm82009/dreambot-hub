
import React, { useState, useEffect } from 'react';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { getSubscriptionName } from '@/utils/subscription';
import { formatDate } from '@/lib/utils';

interface SubscriptionDetailsProps {
  userData: User & {
    dreams_count: number;
  };
  pricingSettings?: any;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ userData, pricingSettings }) => {
  const [subscriptionName, setSubscriptionName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const subscriptionStatus = getSubscriptionStatus(userData);
  
  useEffect(() => {
    const loadSubscriptionName = async () => {
      try {
        const name = await getSubscriptionName(userData?.subscription_type, pricingSettings);
        setSubscriptionName(name);
      } catch (error) {
        console.error('Error loading subscription name:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptionName();
  }, [userData?.subscription_type, pricingSettings]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">تفاصيل الباقة الحالية</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">الباقة:</span>
          <span className="font-medium">
            {loading ? 'جاري التحميل...' : subscriptionName}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">حالة الباقة:</span>
          <span className="font-medium">
            {subscriptionStatus.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
        
        {userData?.subscription_expires_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">تاريخ انتهاء الباقة:</span>
            <span className="font-medium">{formatDate(userData.subscription_expires_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
