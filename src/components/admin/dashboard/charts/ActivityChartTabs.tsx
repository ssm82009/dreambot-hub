
import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DreamsLineChart from './DreamsLineChart';
import UsersBarChart from './UsersBarChart';
import { ChartDataPoint } from '@/hooks/admin/useDashboardChartsData';

interface ActivityChartTabsProps {
  dreamsData: ChartDataPoint[];
  usersData: ChartDataPoint[];
  activeChart: string;
  setActiveChart: (value: string) => void;
  timeRangeLabel: string;
}

const ActivityChartTabs: React.FC<ActivityChartTabsProps> = ({
  dreamsData,
  usersData,
  activeChart,
  setActiveChart,
  timeRangeLabel
}) => {
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>إحصائيات النشاط - {timeRangeLabel}</CardTitle>
          <TabsList>
            <TabsTrigger
              value="dreams"
              onClick={() => setActiveChart('dreams')}
              data-state={activeChart === 'dreams' ? 'active' : ''}
            >
              الأحلام
            </TabsTrigger>
            <TabsTrigger
              value="users"
              onClick={() => setActiveChart('users')}
              data-state={activeChart === 'users' ? 'active' : ''}
            >
              المستخدمين
            </TabsTrigger>
          </TabsList>
        </div>
      </CardHeader>
      <CardContent>
        {activeChart === 'dreams' ? (
          <div className="h-[300px]">
            <DreamsLineChart data={dreamsData} />
          </div>
        ) : (
          <div className="h-[300px]">
            <UsersBarChart data={usersData} />
          </div>
        )}
      </CardContent>
    </>
  );
};

export default ActivityChartTabs;
