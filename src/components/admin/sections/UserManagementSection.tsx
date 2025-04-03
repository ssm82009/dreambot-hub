
import React from 'react';
import { Users } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import UserManagement from '@/components/admin/UserManagement';
import { useAdmin } from '@/contexts/admin';

const UserManagementSection = () => {
  const { users, activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection 
      title="إدارة الأعضاء والصلاحيات" 
      description="إدارة المستخدمين وتعيين الصلاحيات"
      icon={Users}
      isOpen={activeSections.userManagement}
      onToggle={() => toggleSection('userManagement')}
    >
      <UserManagement users={users} />
    </AdminSection>
  );
};

export default UserManagementSection;
