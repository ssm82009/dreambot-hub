
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

      // Fetch paid subscriptions
      let paidSubscriptions = 0;
      if (usersData) {
        paidSubscriptions = usersData.filter(user => {
          // Only count users with non-free subscription types
          return user.subscription_type && 
                 user.subscription_type !== 'free' && 
                 getSubscriptionStatus(user).isActive;
        }).length;
        console.log("Paid subscriptions calculated:", paidSubscriptions);
      }
      setActiveSubscriptions(paidSubscriptions);

      // Fetch total dreams
      const { data: dreamsData, error: dreamsError, count: dreamsCount } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: false });

      if (dreamsError) {
        throw new Error(`Error fetching dreams: ${dreamsError.message}`);
      }
      
      console.log("Dreams data fetched:", dreamsCount, "dreams found");
      setTotalDreams(dreamsCount || 0);

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
