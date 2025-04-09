
import React, { useState } from 'react';
import { Users, Rabbit, CreditCard, PenSquare, TicketCheck } from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import StatsCard from '../dashboard/StatsCard';
import DashboardCharts from '../dashboard/DashboardCharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DashboardStatsSection: React.FC = () => {
  const { dreams, userCount, subscriptions, openTickets } = useAdmin();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // حساب نسبة الاشتراك من إجمالي المستخدمين
  const subscriptionPercentage = userCount > 0 
    ? Math.round((subscriptions / userCount) * 100) 
    : 0;

  // بيانات تظهر التغيير الإيجابي أو السلبي
  const statsWithTrends = [
    {
      title: "الأحلام المقدمة",
      description: "إجمالي عدد الأحلام المقدمة للتفسير",
      value: dreams,
      icon: PenSquare,
      trend: {
        value: 8,
        isPositive: true
      }
    },
    {
      title: "المستخدمين",
      description: "إجمالي عدد المستخدمين المسجلين",
      value: userCount,
      icon: Users,
      trend: {
        value: 5,
        isPositive: true
      }
    },
    {
      title: "الاشتراكات النشطة",
      description: `عدد الاشتراكات النشطة (${subscriptionPercentage}% من المستخدمين)`,
      value: subscriptions,
      icon: CreditCard,
      tooltipText: "الاشتراكات النشطة هي الاشتراكات المدفوعة (المميز أو الاحترافي) التي لم تنتهِ صلاحيتها بعد.",
      trend: {
        value: 3,
        isPositive: true
      }
    },
    {
      title: "التذاكر المفتوحة",
      description: "عدد تذاكر الدعم المفتوحة حالياً",
      value: openTickets ?? 0,
      icon: TicketCheck,
      tooltipText: "التذاكر المفتوحة هي تذاكر الدعم الفني التي لم يتم حلها بعد.",
      trend: {
        value: 2,
        isPositive: false
      }
    },
    {
      title: "سرعة الاستجابة",
      description: "متوسط وقت معالجة الحلم",
      value: "3.2 ثانية",
      icon: Rabbit,
      trend: {
        value: 12,
        isPositive: true
      }
    }
  ];
  
  return (
    <>
      <div className="flex justify-between items-center mb-6 rtl">
        <h2 className="text-2xl font-bold">لوحة الإحصاءات</h2>
        <Card className="p-1">
          <CardContent className="p-0">
            <Tabs defaultValue="week" value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
              <TabsList>
                <TabsTrigger value="week">أسبوع</TabsTrigger>
                <TabsTrigger value="month">شهر</TabsTrigger>
                <TabsTrigger value="year">سنة</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 rtl mb-8">
        {statsWithTrends.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            description={stat.description}
            value={stat.value}
            icon={stat.icon}
            tooltipText={stat.tooltipText}
            trend={stat.trend}
          />
        ))}
      </div>
      
      <DashboardCharts timeRange={timeRange} />
    </>
  );
};

export default DashboardStatsSection;
