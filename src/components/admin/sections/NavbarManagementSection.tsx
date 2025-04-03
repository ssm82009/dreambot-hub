
import React from 'react';
import { LayoutList } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import NavbarManagement from '@/components/admin/NavbarManagement';
import { useAdmin } from '@/contexts/admin';

const NavbarManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection
      title="إدارة شريط التنقل"
      description="تخصيص وترتيب روابط شريط التنقل في الموقع"
      icon={LayoutList}
      isOpen={activeSections.navbarManagement}
      onToggle={() => toggleSection('navbarManagement')}
    >
      <NavbarManagement />
    </AdminSection>
  );
};

export default NavbarManagementSection;
