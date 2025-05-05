
import React from 'react';
import { User } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';
import { formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubscriptionDetailsProps {
  userData: User | null;
  pricingSettings: any;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ userData, pricingSettings }) => {
  if (!userData) {
    return (
      <Alert>
        <AlertDescription>
          لم يتم العثور على بيانات المستخدم
        </AlertDescription>
      </Alert>
    );
  }

  const subscriptionStatus = getSubscriptionStatus(userData);
  
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">تفاصيل الاشتراك</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-muted-foreground">نوع الاشتراك:</div>
        <div className="text-sm font-medium flex items-center">
          <Badge variant={subscriptionStatus.color} className="mr-2">
            {subscriptionStatus.name}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">تاريخ الانتهاء:</div>
        <div className="text-sm font-medium">
          {userData.subscription_expires_at ? 
            formatDate(userData.subscription_expires_at) : 
            'غير محدد'}
        </div>
        
        <div className="text-sm text-muted-foreground">حالة الاشتراك:</div>
        <div className="text-sm font-medium">
          {subscriptionStatus.isActive ? 
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              نشط
            </Badge> : 
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              منتهي
            </Badge>
          }
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
