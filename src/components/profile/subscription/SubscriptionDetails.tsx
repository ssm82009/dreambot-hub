
import React from 'react';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { getSubscriptionName } from '@/utils/subscription';
import { formatDate } from '@/lib/utils';

interface SubscriptionDetailsProps {
  userData: User & {
    dreams_count: number;
  };
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ userData }) => {
  const subscriptionStatus = getSubscriptionStatus(userData);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">تفاصيل الاشتراك الحالي</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">نوع الاشتراك:</span>
          <span className="font-medium">
            {getSubscriptionName(userData?.subscription_type)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">حالة الاشتراك:</span>
          <span className="font-medium">
            {subscriptionStatus.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
        
        {userData?.subscription_expires_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">تاريخ انتهاء الاشتراك:</span>
            <span className="font-medium">{formatDate(userData.subscription_expires_at)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
