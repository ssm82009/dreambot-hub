
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAdmin } from '@/contexts/admin';
import { Users, Calendar, Clock, CreditCard, PenSquare, Ticket } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminData } from '@/hooks/useAdminData';

const DashboardStats: React.FC = () => {
  const { userCount, dreams, subscriptions } = useAdmin();
  const { totalUsers, totalDreams, activeSubscriptions, totalTickets, statsLoading } = useAdminData();
  
  // حساب نسبة الاشتراك من إجمالي المستخدمين
  const displayUsers = totalUsers || userCount || 0;
  const displayDreams = totalDreams || dreams || 0;
  const displaySubscriptions = activeSubscriptions || subscriptions || 0;
  
  const subscriptionPercentage = displayUsers > 0 
    ? Math.round((displaySubscriptions / displayUsers) * 100) 
    : 0;
  
  console.log("Dashboard Stats Component - Data:", {
    dreams: displayDreams,
    userCount: displayUsers,
    subscriptions: displaySubscriptions,
    subscriptionPercentage,
    totalTickets
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 rtl mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-primary" />
            <span>الأحلام المقدمة</span>
          </CardTitle>
          <CardDescription>إجمالي عدد الأحلام المقدمة للتفسير</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{displayDreams}</p>
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
          <p className="text-4xl font-bold">{displayUsers}</p>
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
                <p className="text-4xl font-bold">{displaySubscriptions}</p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>الاشتراكات النشطة هي الاشتراكات المدفوعة (المميز أو الاحترافي) التي لم تنتهِ صلاحيتها بعد.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <span>التذاكر</span>
          </CardTitle>
          <CardDescription>إجمالي عدد تذاكر الدعم المقدمة</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalTickets || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
