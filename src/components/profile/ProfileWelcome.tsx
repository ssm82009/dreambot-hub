
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types/database';
import SubscriptionBadge from '@/components/admin/user/SubscriptionBadge';
import { formatDate } from '@/lib/utils';

interface ProfileWelcomeProps {
  userData: User & {
    dreams_count: number;
    email: string;
  };
}

const ProfileWelcome: React.FC<ProfileWelcomeProps> = ({ userData }) => {
  // Add a safety check for null userData
  if (!userData) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center p-4">
            <p className="text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Get subscription name in Arabic
  const getSubscriptionName = () => {
    switch (userData.subscription_type?.toLowerCase()) {
      case 'premium':
        return 'الباقة المميزة';
      case 'pro':
        return 'الباقة الاحترافية';
      default:
        return 'الباقة المجانية';
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">مرحباً، {userData.full_name || 'مستخدم'}</h3>
            <p className="text-muted-foreground mb-4">{userData.email}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع العضوية:</span>
                <span className="font-medium">{userData.role === 'admin' ? 'مشرف' : 'مستخدم'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">حالة الاشتراك:</span>
                <SubscriptionBadge user={userData} />
              </div>
              
              {userData.subscription_expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ انتهاء الاشتراك:</span>
                  <span className="font-medium">{formatDate(userData.subscription_expires_at)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأحلام المسجلة:</span>
                <span className="font-medium">{userData.dreams_count}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-end">
            <div className="text-center md:text-right space-y-2">
              <h4 className="text-lg font-medium">ملخص الحساب</h4>
              <p className="text-muted-foreground">
                تاريخ الانضمام: {formatDate(userData.created_at)}
              </p>
              
              {userData.subscription_type && userData.subscription_type !== 'free' && (
                <div className="mt-4 p-3 bg-primary/10 rounded-md">
                  <p className="font-medium text-primary">
                    أنت مشترك في {getSubscriptionName()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileWelcome;
