
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardChartsData } from '@/hooks/admin/useDashboardChartsData';
import ActivityChartTabs from './charts/ActivityChartTabs';
import SubscriptionPieChart from './charts/SubscriptionPieChart';
import TimeRangeSelector from './charts/TimeRangeSelector';

interface DashboardChartsProps {
  timeRange: 'week' | 'month' | 'year';
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ timeRange }) => {
  const [activeChart, setActiveChart] = useState('dreams');
  const { dreamsData, usersData, subscriptionData, loading } = useDashboardChartsData(timeRange);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardSkeleton />
        </Card>
        <Card>
          <CardSkeleton />
        </Card>
      </div>
    );
  }

  const getRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'الأسبوع الماضي';
      case 'month': return 'الشهر الماضي';
      case 'year': return 'السنة الماضية';
      default: return 'الأسبوع الماضي';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 rtl">
      <Tabs value={activeChart} onValueChange={setActiveChart}>
        <Card>
          <ActivityChartTabs
            dreamsData={dreamsData}
            usersData={usersData}
            activeChart={activeChart}
            setActiveChart={setActiveChart}
            timeRangeLabel={getRangeLabel()}
          />
        </Card>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الاشتراكات</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <SubscriptionPieChart data={subscriptionData} />
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for loading skeleton
const CardSkeleton = () => (
  <>
    <CardHeader>
      <Skeleton className="h-8 w-3/4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[300px] w-full" />
    </CardContent>
  </>
);

// Import to fix the TypeScript error
import { Tabs } from '@/components/ui/tabs';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default DashboardCharts;
