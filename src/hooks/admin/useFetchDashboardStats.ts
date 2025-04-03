
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';

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

      // Fetch users
      const { data: usersData, error: fetchUsersError } = await supabase
        .from('users')
        .select('*');

      if (fetchUsersError) {
        console.error("خطأ في جلب المستخدمين:", fetchUsersError);
      } else {
        setUsers(usersData || []);
        
        // حساب عدد الاشتراكات النشطة استنادًا إلى حالة الاشتراك المحددة
        const activeSubscriptions = usersData ? usersData.filter(user => {
          const status = getSubscriptionStatus(user);
          return status.isActive;
        }).length : 0;
        
        setSubscriptions(activeSubscriptions);
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
