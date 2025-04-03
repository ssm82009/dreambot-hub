
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/database';
import { getSubscriptionStatus } from '@/components/admin/user/SubscriptionBadge';
import { toast } from 'sonner';

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
      console.log("Fetching dashboard stats...");
      
      // جلب عدد الأحلام
      const { count: dreamsCount, error: dreamsError } = await supabase
        .from('dreams')
        .select('*', { count: 'exact', head: true });
      
      if (dreamsError) {
        console.error("خطأ في جلب عدد الأحلام:", dreamsError);
      } else {
        setDreams(dreamsCount || 0);
      }

      // جلب عدد المستخدمين
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        console.error("خطأ في جلب عدد المستخدمين:", usersError);
      } else {
        setUserCount(usersCount || 0);
      }

      // جلب المستخدمين مع البيانات الحديثة
      const { data: usersData, error: fetchUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchUsersError) {
        console.error("خطأ في جلب المستخدمين:", fetchUsersError);
        toast.error("حدث خطأ في جلب بيانات المستخدمين");
      } else {
        console.log("User data received:", usersData?.length);
        
        if (usersData) {
          // تعيين بيانات المستخدمين
          setUsers(usersData);
          
          // حساب الاشتراكات النشطة بناءً على منطق الحالة المحسن
          const activeSubscriptions = usersData.filter(user => {
            const status = getSubscriptionStatus(user);
            return status.isActive;
          }).length;
          
          console.log("Active subscriptions calculated:", activeSubscriptions);
          console.log("Subscription details:", usersData.map(user => ({
            email: user.email,
            type: user.subscription_type,
            expires: user.subscription_expires_at,
            isActive: getSubscriptionStatus(user).isActive
          })));
          
          setSubscriptions(activeSubscriptions);
        } else {
          setUsers([]);
          setSubscriptions(0);
        }
      }

      // جلب الصفحات
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
      toast.error("حدث خطأ في تحديث لوحة التحكم");
    }
  };

  return { fetchDashboardStats };
};
