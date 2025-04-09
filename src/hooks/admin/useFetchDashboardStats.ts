
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

      // Get accurate dreams count - try multiple methods if needed
      // First attempt: Count directly using Supabase count
      console.log("Fetching dreams count directly...");
      const { count: dreamsCount, error: dreamsCountError } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (dreamsCountError) {
        console.error("Error getting dreams count via direct method:", dreamsCountError);
        
        // Second attempt: Get all dreams and count them
        console.log("Trying alternative method to count dreams...");
        const { data: allDreams, error: allDreamsError } = await supabase
          .from('dreams')
          .select('id');
        
        if (allDreamsError) {
          console.error("Error with alternative dreams count method:", allDreamsError);
          throw new Error(`Failed to get dreams count: ${allDreamsError.message}`);
        }
        
        const dreamsTotal = allDreams?.length || 0;
        console.log(`Dreams count (alternative method): ${dreamsTotal}`);
        setTotalDreams(dreamsTotal);
      } else {
        console.log(`Dreams count (direct method): ${dreamsCount}`);
        setTotalDreams(dreamsCount || 0);
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

      // Fetch open tickets
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
