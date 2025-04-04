
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// Update the imports to reference the correct utility
import { getSubscriptionStatus } from '@/utils/subscriptionStatus';

export const useFetchDashboardStats = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [totalDreams, setTotalDreams] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch total users
        const { data: usersData, error: usersError, count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: false });

        if (usersError) {
          throw new Error(`Error fetching users: ${usersError.message}`);
        }

        setTotalUsers(usersCount || 0);

        // Fetch active subscriptions
        let activeCount = 0;
        if (usersData) {
          activeCount = usersData.filter(user => getSubscriptionStatus(user).isActive).length;
        }
        setActiveSubscriptions(activeCount);

        // Fetch total dreams
        const { data: dreamsData, error: dreamsError, count: dreamsCount } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: false });

        if (dreamsError) {
          throw new Error(`Error fetching dreams: ${dreamsError.message}`);
        }

        setTotalDreams(dreamsCount || 0);

        // Fetch total tickets
        const { data: ticketsData, error: ticketsError, count: ticketsCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: false });

        if (ticketsError) {
          throw new Error(`Error fetching tickets: ${ticketsError.message}`);
        }

        setTotalTickets(ticketsCount || 0);

      } catch (err: any) {
        setError(err);
        console.error("Error fetching dashboard stats:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    totalUsers,
    activeSubscriptions,
    totalDreams,
    totalTickets,
    loading,
    error,
  };
};
