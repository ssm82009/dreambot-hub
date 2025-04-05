
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth } from 'date-fns';
import { arSA } from 'date-fns/locale';

export const useRevenueStats = () => {
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [yearlyRevenue, setYearlyRevenue] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByPlan, setRevenueByPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Fetch all successful payment transactions
      const { data: transactions, error } = await supabase
        .from('payment_invoices')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate daily revenue (last 7 days)
      const dailyData = calculateDailyRevenue(transactions);
      setDailyRevenue(dailyData);

      // Calculate monthly revenue (last 12 months)
      const monthlyData = calculateMonthlyRevenue(transactions);
      setMonthlyRevenue(monthlyData);

      // Calculate yearly revenue
      const yearlyData = calculateYearlyRevenue(transactions);
      setYearlyRevenue(yearlyData);

      // Calculate total revenue
      const total = transactions.reduce((sum, transaction) => sum + (parseFloat(transaction.amount) || 0), 0);
      setTotalRevenue(total);

      // Calculate revenue by plan
      const planRevenue = calculateRevenueByPlan(transactions);
      setRevenueByPlan(planRevenue);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyRevenue = (transactions: any[]) => {
    // Create a map for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      return {
        date: formattedDate,
        name: format(date, 'dd MMM', { locale: arSA }),
        amount: 0
      };
    }).reverse();

    // Fill in the amounts
    transactions.forEach(transaction => {
      const transactionDate = transaction.created_at ? 
        format(new Date(transaction.created_at), 'yyyy-MM-dd') : null;
      
      if (transactionDate) {
        const dayEntry = last7Days.find(day => day.date === transactionDate);
        if (dayEntry) {
          dayEntry.amount += parseFloat(transaction.amount) || 0;
        }
      }
    });

    return last7Days;
  };

  const calculateMonthlyRevenue = (transactions: any[]) => {
    // Create a map for the last 12 months
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthYear = format(date, 'yyyy-MM');
      
      return {
        monthYear,
        start: format(monthStart, 'yyyy-MM-dd'),
        end: format(monthEnd, 'yyyy-MM-dd'),
        name: format(date, 'MMM yyyy', { locale: arSA }),
        amount: 0
      };
    }).reverse();

    // Fill in the amounts
    transactions.forEach(transaction => {
      if (!transaction.created_at) return;
      
      const transactionDate = new Date(transaction.created_at);
      const transactionMonthYear = format(transactionDate, 'yyyy-MM');
      
      const monthEntry = last12Months.find(month => month.monthYear === transactionMonthYear);
      if (monthEntry) {
        monthEntry.amount += parseFloat(transaction.amount) || 0;
      }
    });

    return last12Months;
  };

  const calculateYearlyRevenue = (transactions: any[]) => {
    // Get the last 5 years
    const currentYear = new Date().getFullYear();
    const last5Years = Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return {
        year: year.toString(),
        name: year.toString(),
        amount: 0
      };
    }).reverse();

    // Fill in the amounts
    transactions.forEach(transaction => {
      if (!transaction.created_at) return;
      
      const transactionYear = format(new Date(transaction.created_at), 'yyyy');
      
      const yearEntry = last5Years.find(year => year.year === transactionYear);
      if (yearEntry) {
        yearEntry.amount += parseFloat(transaction.amount) || 0;
      }
    });

    return last5Years;
  };

  const calculateRevenueByPlan = (transactions: any[]) => {
    const planRevenue: Record<string, number> = {
      premium: 0,
      pro: 0,
      free: 0
    };

    transactions.forEach(transaction => {
      const plan = transaction.plan_name?.toLowerCase() || 'unknown';
      if (plan.includes('premium') || plan.includes('مميز')) {
        planRevenue.premium += parseFloat(transaction.amount) || 0;
      } else if (plan.includes('pro') || plan.includes('احتراف')) {
        planRevenue.pro += parseFloat(transaction.amount) || 0;
      } else {
        planRevenue.free += parseFloat(transaction.amount) || 0;
      }
    });

    return [
      { name: 'الباقة المميزة', value: planRevenue.premium },
      { name: 'الباقة الاحترافية', value: planRevenue.pro },
      { name: 'أخرى', value: planRevenue.free }
    ].filter(item => item.value > 0);
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return {
    dailyRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalRevenue,
    revenueByPlan,
    loading,
    refreshRevenueData: fetchRevenueData
  };
};
