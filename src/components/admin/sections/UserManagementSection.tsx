
import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import UserManagement from '@/components/admin/UserManagement';
import { useAdmin } from '@/contexts/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UserManagementSection = () => {
  const { users, setUsers, activeSections, toggleSection } = useAdmin();

  // تحديث بيانات المستخدمين عند فتح القسم
  useEffect(() => {
    if (activeSections.users) {
      const fetchUsers = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching users:', error);
            toast.error('حدث خطأ في جلب بيانات المستخدمين');
          } else {
            console.log('Fetched users in UserManagementSection:', data);
            setUsers(data || []);
          }
        } catch (error) {
          console.error('Error in fetchUsers:', error);
        }
      };

      fetchUsers();
    }
  }, [activeSections.users, setUsers]);

  return (
    <AdminSection 
      title="إدارة الأعضاء والصلاحيات" 
      description="إدارة المستخدمين وتعيين الصلاحيات والباقات"
      icon={Users}
      isOpen={activeSections.users}
      onToggle={() => toggleSection('users')}
    >
      <UserManagement users={users} />
    </AdminSection>
  );
};

export default UserManagementSection;
