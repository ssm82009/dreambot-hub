
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/contexts/admin';
import { Users, Calendar, Clock, CreditCard, PenSquare } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { dreams, userCount, subscriptions } = useAdmin();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rtl mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-primary" />
            <span>الأحلام المقدمة</span>
          </CardTitle>
          <CardDescription>إجمالي عدد الأحلام المقدمة للتفسير</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{dreams}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>المستخدمين</span>
          </CardTitle>
          <CardDescription>إجمالي عدد المستخدمين المسجلين</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{userCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>الاشتراكات</span>
          </CardTitle>
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
