
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { ChartDataPoint } from '@/hooks/admin/useDashboardChartsData';

interface UsersBarChartProps {
  data: ChartDataPoint[];
}

const UsersBarChart: React.FC<UsersBarChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        users: { label: 'المستخدمين الجدد', color: '#64B5F6' },
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayName" />
          <YAxis />
          <RechartsTooltip formatter={(value) => [`${value}`, 'عدد المستخدمين']} />
          <Bar dataKey="count" name="users" fill="#64B5F6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default UsersBarChart;
