
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';

export const useFetchDashboardStats = () => {
  const {
    setDreams,
    setUserCount,
    setSubscriptions,
    setUsers,
    setPages,
  } = useAdmin();

  const fetchDashboardStats = async () => {
    try {
      // Fetch dream count
      const { count: dreamsCount, error: dreamsError } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (dreamsError) {
        console.error("خطأ في جلب عدد الأحلام:", dreamsError);
      } else {
        setDreams(dreamsCount || 0);
      }

      // Fetch user count
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("خطأ في جلب عدد المستخدمين:", usersError);
      } else {
        setUserCount(usersCount || 0);
      }

      // Fetch active subscriptions count
      const { count: subscriptionsCount, error: subscriptionsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_type', 'free')
        .gt('subscription_expires_at', new Date().toISOString());
      
      if (subscriptionsError) {
        console.error("خطأ في جلب عدد الاشتراكات:", subscriptionsError);
      } else {
        setSubscriptions(subscriptionsCount || 0);
      }

      // Fetch users
      const { data: usersData, error: fetchUsersError } = await supabase
        .from('users')
        .select('*');

      if (fetchUsersError) {
        console.error("خطأ في جلب المستخدمين:", fetchUsersError);
      } else {
        setUsers(usersData || []);
      }

      // Fetch pages
      const { data: pagesData, error: fetchPagesError } = await supabase
        .from('custom_pages')
        .select('*');

      if (fetchPagesError) {
        console.error("خطأ في جلب الصفحات:", fetchPagesError);
      } else {
        setPages(pagesData || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الإحصائيات:", error);
    }
  };

  return { fetchDashboardStats };
};
