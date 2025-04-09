
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { ArDisplay } from '@/lib/utils';

export interface ChartDataPoint {
  name: string;
  count: number;
  displayName: string;
}

export interface SubscriptionChartData {
  name: string;
  value: number;
}

export const useDashboardChartsData = (timeRange: 'week' | 'month' | 'year') => {
  const [dreamsData, setDreamsData] = useState<ChartDataPoint[]>([]);
  const [usersData, setUsersData] = useState<ChartDataPoint[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Fetching chart data for time range:", timeRange);
        const startDate = getStartDateByRange(timeRange);
        
        // Fetch dreams data
        console.log("Fetching dreams data since:", startDate.toISOString());
        const { data: dreamsStats, error: dreamsError } = await supabase
          .from('dreams')
          .select('created_at')
          .gte('created_at', startDate.toISOString());

        if (dreamsError) {
          console.error('Error fetching dreams for chart:', dreamsError);
        }

        console.log("Dreams data fetched for chart:", dreamsStats?.length || 0, "dreams found");

        if (dreamsStats) {
          const processedDreams = processDateData(dreamsStats, timeRange);
          setDreamsData(processedDreams);
        }

        // Fetch users data
        console.log("Fetching users data since:", startDate.toISOString());
        const { data: usersStats, error: usersError } = await supabase
          .from('users')
          .select('created_at, subscription_type')
          .gte('created_at', startDate.toISOString());

        if (usersError) {
          console.error('Error fetching users for chart:', usersError);
        }

        console.log("Users data fetched for chart:", usersStats?.length || 0, "users found");

        if (usersStats) {
          const processedUsers = processDateData(usersStats, timeRange);
          setUsersData(processedUsers);

          // Process subscription data
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

  // Get start date based on selected time range
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

  // Process date data based on time range
  const processDateData = (data: any[], range: 'week' | 'month' | 'year'): ChartDataPoint[] => {
    let days: ChartDataPoint[] = [];
    const today = new Date();
    
    switch (range) {
      case 'week':
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
        days = Array.from({ length: 12 }, (_, i) => {
          const date = subMonths(today, i);
          return {
            name: format(date, 'yyyy-MM'),
            count: 0,
            displayName: ArDisplay.formatDate(date),
          };
        }).reverse();
        break;
    }
    
    // Count data for each time period
    data.forEach(item => {
      const itemDate = new Date(item.created_at);
      
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

  return {
    dreamsData,
    usersData,
    subscriptionData,
    loading
  };
};
