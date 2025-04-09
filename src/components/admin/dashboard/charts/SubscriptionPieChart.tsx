
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { SubscriptionChartData } from '@/hooks/admin/useDashboardChartsData';

interface SubscriptionPieChartProps {
  data: SubscriptionChartData[];
}

const COLORS = ['#9b87f5', '#64B5F6', '#81C784', '#FFB74D'];

const SubscriptionPieChart: React.FC<SubscriptionPieChartProps> = ({ data }) => {
  return (
    <ChartContainer
      config={{
        free: { label: 'مجاني', color: '#9b87f5' },
        premium: { label: 'مميز', color: '#64B5F6' },
        pro: { label: 'احترافي', color: '#81C784' },
        undefined: { label: 'غير محدد', color: '#FFB74D' },
      }}
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <RechartsTooltip formatter={(value) => [`${value}`, 'المستخدمين']} />
      </PieChart>
    </ChartContainer>
  );
};

export default SubscriptionPieChart;
