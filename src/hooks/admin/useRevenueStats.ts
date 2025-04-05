
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface RevenueData {
  name: string;
  amount: number;
}

interface PlanRevenueData {
  name: string;
  value: number;
}

export const useRevenueStats = () => {
  const [dailyRevenue, setDailyRevenue] = useState<RevenueData[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [revenueByPlan, setRevenueByPlan] = useState<PlanRevenueData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRevenueStats = async () => {
      setLoading(true);
      try {
        // Fetch all successful transactions
        const { data: transactions, error } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('status', 'paid');

        if (error) throw error;

        if (!transactions || transactions.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate daily revenue for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return {
            name: format(date, 'yyyy-MM-dd'),
            displayName: format(date, 'MM/dd'),
            amount: 0
          };
        }).reverse();

        // Calculate monthly revenue for last 6 months
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            name: format(date, 'yyyy-MM'),
            displayName: format(date, 'MMM yyyy'),
            amount: 0
          };
        }).reverse();

        // Calculate yearly revenue for last 3 years
        const last3Years = Array.from({ length: 3 }, (_, i) => {
          const date = new Date();
          date.setFullYear(date.getFullYear() - i);
          return {
            name: format(date, 'yyyy'),
            displayName: format(date, 'yyyy'),
            amount: 0
          };
        }).reverse();

        // Initialize plan revenue counters
        const planRevenue = {
          free: 0,
          premium: 0,
          pro: 0
        };

        let total = 0;

        // Process transactions
        transactions.forEach(transaction => {
          const amount = Number(transaction.amount) || 0;
          const date = new Date(transaction.created_at);
          const formattedDate = format(date, 'yyyy-MM-dd');
          const formattedMonth = format(date, 'yyyy-MM');
          const formattedYear = format(date, 'yyyy');

          // Add to total revenue
          total += amount;

          // Add to daily revenue
          const dayData = last7Days.find(day => day.name === formattedDate);
          if (dayData) {
            dayData.amount += amount;
          }

          // Add to monthly revenue
          const monthData = last6Months.find(month => month.name === formattedMonth);
          if (monthData) {
            monthData.amount += amount;
          }

          // Add to yearly revenue
          const yearData = last3Years.find(year => year.name === formattedYear);
          if (yearData) {
            yearData.amount += amount;
          }

          // Add to plan revenue
          const planType = (transaction.plan_name || '').toLowerCase();
          if (planType.includes('premium')) {
            planRevenue.premium += amount;
          } else if (planType.includes('pro')) {
            planRevenue.pro += amount;
          } else {
            planRevenue.free += amount;
          }
        });

        // Update state with calculated revenue data
        setDailyRevenue(last7Days.map(day => ({
          name: day.displayName,
          amount: day.amount
        })));

        setMonthlyRevenue(last6Months.map(month => ({
          name: month.displayName,
          amount: month.amount
        })));

        setYearlyRevenue(last3Years.map(year => ({
          name: year.displayName,
          amount: year.amount
        })));

        setTotalRevenue(total);

        setRevenueByPlan([
          { name: 'مميز', value: planRevenue.premium },
          { name: 'احترافي', value: planRevenue.pro },
          { name: 'مجاني', value: planRevenue.free }
        ]);

      } catch (error) {
        console.error('Error fetching revenue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, []);

  return {
    dailyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalRevenue,
    revenueByPlan,
    loading
  };
};
