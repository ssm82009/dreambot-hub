
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NotificationForm from '../notifications/NotificationForm';
import NotificationStats from '../notifications/NotificationStats';
import { useNotificationData } from '@/hooks/notifications/useNotificationData';

const NotificationsSection: React.FC = () => {
  const { subscribersCount, users, loading } = useNotificationData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الإشعارات</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NotificationStats 
          subscribersCount={subscribersCount} 
          loading={loading} 
        />

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>إرسال إشعار جديد</CardTitle>
            <CardDescription>أرسل إشعارات للمستخدمين والمشرفين</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationForm users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsSection;
