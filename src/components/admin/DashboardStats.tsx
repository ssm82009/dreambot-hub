
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/contexts/admin';
import { Users, Calendar, Clock, CreditCard, PenSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DashboardStats: React.FC = () => {
  const { dreams, userCount, subscriptions, users } = useAdmin();
  
  // حساب نسبة الاشتراك من إجمالي المستخدمين
  const subscriptionPercentage = userCount > 0 
    ? Math.round((subscriptions / userCount) * 100) 
    : 0;
  
  console.log("Dashboard Stats - Active Subscriptions:", subscriptions);
  console.log("Dashboard Stats - Total Users:", userCount);
  console.log("Dashboard Stats - Percentage:", subscriptionPercentage);
  
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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>الاشتراكات النشطة</span>
                </CardTitle>
                <CardDescription>عدد الاشتراكات النشطة ({subscriptionPercentage}% من المستخدمين)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{subscriptions}</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>الاشتراكات النشطة هي الاشتراكات المدفوعة (المميز أو الاحترافي) التي لم تنتهِ صلاحيتها بعد.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DashboardStats;
