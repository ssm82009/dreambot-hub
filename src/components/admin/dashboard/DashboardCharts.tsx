
import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { ArDisplay } from '@/lib/utils';

const COLORS = ['#9b87f5', '#64B5F6', '#81C784', '#FFB74D'];

const DashboardCharts: React.FC = () => {
  const [dreamsData, setDreamsData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // أحضر بيانات الأحلام المقدمة حسب التاريخ
        const { data: dreamsStats, error: dreamsError } = await supabase
          .from('dreams')
          .select('created_at')
          .order('created_at', { ascending: false });

        if (dreamsError) {
          console.error('Error fetching dreams:', dreamsError);
        }

        if (dreamsStats) {
          // معالجة البيانات لتجميع الأحلام حسب اليوم
          const processedDreams = processDateData(dreamsStats);
          setDreamsData(processedDreams);
        }

        // أحضر بيانات المستخدمين حسب التاريخ
        const { data: usersStats, error: usersError } = await supabase
          .from('users')
          .select('created_at, subscription_type')
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Error fetching users:', usersError);
        }

        if (usersStats) {
          // معالجة البيانات لتجميع المستخدمين حسب اليوم
          const processedUsers = processDateData(usersStats);
          setUsersData(processedUsers);

          // معالجة بيانات الاشتراكات
          const subscriptions = [
            { name: 'مجاني', value: usersStats.filter(u => u.subscription_type === 'free').length },
            { name: 'مميز', value: usersStats.filter(u => u.subscription_type === 'premium').length },
            { name: 'احترافي', value: usersStats.filter(u => u.subscription_type === 'pro').length },
            { name: 'غير محدد', value: usersStats.filter(u => !u.subscription_type).length }
          ];
          setSubscriptionData(subscriptions);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // معالجة البيانات حسب التاريخ
  const processDateData = (data: any[]) => {
    // أنشئ مجموعة البيانات للأيام السبعة الماضية
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        name: format(date, 'yyyy-MM-dd'),
        count: 0,
        displayName: ArDisplay.formatDate(date),
      };
    }).reverse();
    
    // عدّ البيانات لكل يوم
    data.forEach(item => {
      const itemDate = format(new Date(item.created_at), 'yyyy-MM-dd');
      const dayData = last7Days.find(day => day.name === itemDate);
      if (dayData) {
        dayData.count++;
      }
    });
    
    return last7Days;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">جاري تحميل الرسوم البيانية...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 rtl">
      <Tabs defaultValue="dreams">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>إحصائيات النشاط</CardTitle>
              <TabsList>
                <TabsTrigger value="dreams">الأحلام</TabsTrigger>
                <TabsTrigger value="users">المستخدمين</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="dreams" className="h-[300px]">
              <ChartContainer config={{
                dreams: { label: 'الأحلام المقدمة', color: '#9b87f5' },
              }}>
                <LineChart data={dreamsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayName" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'عدد الأحلام']} />
                  <Line type="monotone" dataKey="count" name="dreams" stroke="#9b87f5" activeDot={{ r: 8 }} />
                </LineChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="users" className="h-[300px]">
              <ChartContainer config={{
                users: { label: 'المستخدمين الجدد', color: '#64B5F6' },
              }}>
                <BarChart data={usersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayName" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'عدد المستخدمين']} />
                  <Bar dataKey="count" name="users" fill="#64B5F6" />
                </BarChart>
              </ChartContainer>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الاشتراكات</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={{
            free: { label: 'مجاني', color: '#9b87f5' },
            premium: { label: 'مميز', color: '#64B5F6' },
            pro: { label: 'احترافي', color: '#81C784' },
            undefined: { label: 'غير محدد', color: '#FFB74D' },
          }}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'المستخدمين']} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
