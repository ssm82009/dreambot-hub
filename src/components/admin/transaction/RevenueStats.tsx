
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArDisplay } from '@/lib/utils';

interface RevenueStatsProps {
  dailyRevenue: any[];
  monthlyRevenue: any[];
  yearlyRevenue: any[];
  totalRevenue: number;
  revenueByPlan: any[];
}

const COLORS = ['#9b87f5', '#64B5F6', '#81C784'];

const RevenueStats: React.FC<RevenueStatsProps> = ({ 
  dailyRevenue, 
  monthlyRevenue, 
  yearlyRevenue, 
  totalRevenue,
  revenueByPlan
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} ريال</p>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>إحصائيات الإيرادات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="h-[250px]">
            <TabsList className="h-8 mb-4">
              <TabsTrigger value="daily" className="text-xs px-2 py-0.5">يومي</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2 py-0.5">شهري</TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs px-2 py-0.5">سنوي</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs px-2 py-0.5">حسب الباقة</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="h-full">
              <ChartContainer config={{
                revenue: { label: 'الإيرادات اليومية', color: '#9b87f5' },
              }} className="h-full">
                <LineChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                  <Line type="monotone" dataKey="amount" name="revenue" stroke="#9b87f5" />
                </LineChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="monthly" className="h-full">
              <ChartContainer config={{
                revenue: { label: 'الإيرادات الشهرية', color: '#64B5F6' },
              }} className="h-full">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                  <Bar dataKey="amount" name="revenue" fill="#64B5F6" />
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="yearly" className="h-full">
              <ChartContainer config={{
                revenue: { label: 'الإيرادات السنوية', color: '#81C784' },
              }} className="h-full">
                <BarChart data={yearlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                  <Bar dataKey="amount" name="revenue" fill="#81C784" />
                </BarChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="plans" className="h-full">
              <ChartContainer config={{
                premium: { label: 'الباقة المميزة', color: '#64B5F6' },
                pro: { label: 'الباقة الاحترافية', color: '#81C784' },
                free: { label: 'الباقة المجانية', color: '#9b87f5' },
              }} className="h-full">
                <PieChart>
                  <Pie
                    data={revenueByPlan}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {revenueByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ريال`, 'الإيرادات']} />
                </PieChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueStats;
