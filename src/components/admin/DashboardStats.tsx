
import React from 'react';
import { Users, Rabbit, CreditCard, PenSquare, TicketCheck } from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import StatsCard from './dashboard/StatsCard';
import DashboardCharts from './dashboard/DashboardCharts';

const DashboardStats: React.FC = () => {
  const { dreams, userCount, subscriptions, openTickets } = useAdmin();
  
  // حساب نسبة الاشتراك من إجمالي المستخدمين
  const subscriptionPercentage = userCount > 0 
    ? Math.round((subscriptions / userCount) * 100) 
    : 0;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 rtl mb-8">
        <StatsCard 
          title="الأحلام المقدمة"
          description="إجمالي عدد الأحلام المقدمة للتفسير"
          value={dreams}
          icon={PenSquare}
        />
        
        <StatsCard 
          title="المستخدمين"
          description="إجمالي عدد المستخدمين المسجلين"
          value={userCount}
          icon={Users}
        />
        
        <StatsCard 
          title="الاشتراكات المدفوعة"
          description={`عدد الاشتراكات المدفوعة (${subscriptionPercentage}% من المستخدمين)`}
          value={subscriptions}
          icon={CreditCard}
          tooltipText="الاشتراكات المدفوعة هي الاشتراكات المدفوعة (المميز أو الاحترافي) التي لم تنتهِ صلاحيتها بعد."
        />
        
        <StatsCard 
          title="التذاكر المفتوحة"
          description="عدد تذاكر الدعم المفتوحة حالياً"
          value={openTickets ?? 0}
          icon={TicketCheck}
          tooltipText="التذاكر المفتوحة هي تذاكر الدعم الفني التي لم يتم حلها بعد."
        />
        
        <StatsCard 
          title="سرعة الاستجابة"
          description="متوسط وقت معالجة الحلم"
          value="3.2 ثانية"
          icon={Rabbit}
          trend={{
            value: 12,
            isPositive: true
          }}
        />
      </div>
      
      <DashboardCharts />
    </>
  );
};

export default DashboardStats;
