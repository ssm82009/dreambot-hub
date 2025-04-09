
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Update the imports to reference the correct utility
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';

export const useFetchDashboardStats = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [totalDreams, setTotalDreams] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching dashboard statistics...");
      // Fetch total users
      const { data: usersData, error: usersError, count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: false });

      if (usersError) {
        throw new Error(`Error fetching users: ${usersError.message}`);
      }
      
      console.log("Users data fetched:", usersData?.length, "users found");
      setTotalUsers(usersCount || 0);

      // Fetch active subscriptions
      let activeCount = 0;
      if (usersData) {
        activeCount = usersData.filter(user => {
          const status = getSubscriptionStatus(user);
          return status.isActive;
        }).length;
        console.log("Active subscriptions calculated:", activeCount);
      }
      setActiveSubscriptions(activeCount);

      // تحسين طريقة جلب عدد الأحلام باستخدام استعلام أكثر دقة
      console.log("Fetching accurate dreams count...");
      // استخدام استعلام مباشر بواسطة حساب عدد السجلات بناءً على حقل id
      const { count: exactDreamsCount, error: countError } = await supabase
        .from('dreams')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Error in exact dreams count: ${countError.message}`);
      }

      // طباعة العدد الدقيق للأحلام
      console.log("Exact dreams count from database:", exactDreamsCount);
      
      // إذا كان هناك مشكلة في الحصول على العدد، نستخدم طريقة بديلة
      if (exactDreamsCount === null) {
        console.log("Count returned null, using alternative counting method");
        const { data: allDreams, error: allDreamsError } = await supabase
          .from('dreams')
          .select('id');
        
        if (allDreamsError) {
          throw new Error(`Error in alternative dreams count: ${allDreamsError.message}`);
        }
        
        const manualCount = allDreams?.length || 0;
        console.log("Manual dreams count:", manualCount);
        setTotalDreams(manualCount);
      } else {
        setTotalDreams(exactDreamsCount);
      }

      // Fetch total tickets
      const { data: ticketsData, error: ticketsError, count: ticketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: false });

      if (ticketsError) {
        throw new Error(`Error fetching tickets: ${ticketsError.message}`);
      }
      
      console.log("Tickets data fetched:", ticketsCount, "tickets found");
      setTotalTickets(ticketsCount || 0);

      // جلب عدد التذاكر المفتوحة
      const { data: openTicketsData, error: openTicketsError, count: openTicketsCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: false })
        .eq('status', 'open');

      if (openTicketsError) {
        throw new Error(`Error fetching open tickets: ${openTicketsError.message}`);
      }
      
      console.log("Open tickets data fetched:", openTicketsCount, "open tickets found");
      setOpenTickets(openTicketsCount || 0);

      // Update last updated timestamp
      setLastUpdated(new Date());

    } catch (err: any) {
      setError(err);
      console.error("Error fetching dashboard stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    totalUsers,
    activeSubscriptions,
    totalDreams,
    totalTickets,
    openTickets,
    loading,
    error,
    lastUpdated,
    fetchDashboardStats,
  };
};
