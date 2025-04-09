
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { ChartDataPoint } from '@/hooks/admin/useDashboardChartsData';

interface DreamsLineChartProps {
  data: ChartDataPoint[];
}

const DreamsLineChart: React.FC<DreamsLineChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        dreams: { label: 'الأحلام المقدمة', color: '#9b87f5' },
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayName" />
          <YAxis />
          <RechartsTooltip formatter={(value) => [`${value}`, 'عدد الأحلام']} />
          <Line
            type="monotone"
            dataKey="count"
            name="dreams"
            stroke="#9b87f5"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default DreamsLineChart;
