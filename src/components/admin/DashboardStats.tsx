
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';

const DashboardStats: React.FC = () => {
  const { dreams, userCount, subscriptions } = useAdmin();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rtl mb-8">
      <Card>
        <CardHeader>
          <CardTitle>الأحلام المقدمة</CardTitle>
          <CardDescription>إجمالي عدد الأحلام المقدمة للتفسير</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dreams}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>إجمالي عدد المستخدمين المسجلين</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{userCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الاشتراكات</CardTitle>
          <CardDescription>عدد الاشتراكات النشطة</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{subscriptions}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
