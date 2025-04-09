
import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { ArDisplay } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#9b87f5', '#64B5F6', '#81C784', '#FFB74D'];

interface DashboardChartsProps {
  timeRange: 'week' | 'month' | 'year';
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ timeRange }) => {
  const [dreamsData, setDreamsData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('dreams');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // تحديد النطاق الزمني بناءً على الفلتر المحدد
        const startDate = getStartDateByRange(timeRange);
        
        // تأكد من عدم استخدام الذاكرة المؤقتة للبيانات
        const { data: dreamsStats, error: dreamsError } = await supabase
          .from('dreams')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .noCache();

        if (dreamsError) {
          console.error('Error fetching dreams:', dreamsError);
        }

        if (dreamsStats) {
          // معالجة البيانات لتجميع الأحلام حسب الفترة الزمنية
          const processedDreams = processDateData(dreamsStats, timeRange);
          setDreamsData(processedDreams);
        }

        // أحضر بيانات المستخدمين حسب التاريخ
        const { data: usersStats, error: usersError } = await supabase
          .from('users')
          .select('created_at, subscription_type')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .noCache();

        if (usersError) {
          console.error('Error fetching users:', usersError);
        }

        if (usersStats) {
          // معالجة البيانات لتجميع المستخدمين حسب الفترة الزمنية
          const processedUsers = processDateData(usersStats, timeRange);
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
  }, [timeRange]);

  // الحصول على تاريخ البداية استنادًا إلى النطاق الزمني المحدد
  const getStartDateByRange = (range: 'week' | 'month' | 'year'): Date => {
    const today = new Date();
    switch (range) {
      case 'week':
        return subDays(today, 7);
      case 'month':
        return subMonths(today, 1);
      case 'year':
        return subYears(today, 1);
      default:
        return subDays(today, 7);
    }
  };

  // معالجة البيانات حسب التاريخ والنطاق الزمني
  const processDateData = (data: any[], range: 'week' | 'month' | 'year') => {
    let days: any[] = [];
    const today = new Date();
    
    switch (range) {
      case 'week':
        // أنشئ مجموعة البيانات للأيام السبعة الماضية
        days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, i);
          return {
            name: format(date, 'yyyy-MM-dd'),
            count: 0,
            displayName: ArDisplay.formatDate(date),
          };
        }).reverse();
        break;
        
      case 'month':
        // أنشئ مجموعة البيانات للشهر الماضي (بفاصل 3 أيام)
        days = Array.from({ length: 10 }, (_, i) => {
          const date = subDays(today, i * 3);
          return {
            name: format(date, 'yyyy-MM-dd'),
            count: 0,
            displayName: ArDisplay.formatDate(date),
          };
        }).reverse();
        break;
        
      case 'year':
        // أنشئ مجموعة البيانات للسنة الماضية (بفاصل شهر)
        days = Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(today, i);
          return {
            name: format(date, 'yyyy-MM'),
            count: 0,
            // تصحيح: إزالة المعامل الثاني من استدعاء ArDisplay.formatDate
            displayName: ArDisplay.formatDate(date),
          };
        }).reverse();
        break;
    }
    
    // عدّ البيانات لكل فترة زمنية
    data.forEach(item => {
      const itemDate = new Date(item.created_at);
      
      // اعتمادًا على النطاق الزمني، نحدد كيفية مطابقة التواريخ
      if (range === 'year') {
        const itemMonth = format(itemDate, 'yyyy-MM');
        const dayData = days.find(day => day.name === itemMonth);
        if (dayData) {
          dayData.count++;
        }
      } else {
        const itemDateStr = format(itemDate, 'yyyy-MM-dd');
        const dayData = days.find(day => day.name === itemDateStr);
        if (dayData) {
          dayData.count++;
        }
      }
    });
    
    return days;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>إحصائيات النشاط - {getRangeLabel()}</CardTitle>
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
                  <RechartsTooltip formatter={(value) => [`${value}`, 'عدد الأحلام']} />
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
                  <RechartsTooltip formatter={(value) => [`${value}`, 'عدد المستخدمين']} />
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
              <Legend />
              <RechartsTooltip formatter={(value) => [`${value}`, 'المستخدمين']} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
