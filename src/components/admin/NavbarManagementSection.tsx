
import React from 'react';
import { LayoutList } from 'lucide-react';
import AdminSection from './AdminSection';
import NavbarManagement from './NavbarManagement';
import { useAdmin } from '@/contexts/admin';

const NavbarManagementSection = () => {
  const { activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection
      title="إدارة شريط التنقل"
      description="تخصيص وترتيب روابط شريط التنقل في الموقع"
      icon={<LayoutList className="h-5 w-5" />}
      isOpen={activeSections.navbarManagement}
      onToggle={() => toggleSection('navbarManagement')}
    >
      <NavbarManagement />
    </AdminSection>
  );
};

export default NavbarManagementSection;
