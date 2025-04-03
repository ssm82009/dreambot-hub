
import React from 'react';
import { Search } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import SeoSettingsForm from '@/components/admin/SeoSettingsForm';
import { useAdmin } from '@/contexts/admin';

const SeoSettingsSection = () => {
  const { activeSections, toggleSection } = useAdmin();

  return (
    <AdminSection 
      title="تحسين محركات البحث (SEO)" 
      description="إدارة إعدادات السيو والكلمات المفتاحية وخريطة الموقع"
      icon={Search}
      isOpen={activeSections.seoSettings}
      onToggle={() => toggleSection('seoSettings')}
    >
      <SeoSettingsForm />
    </AdminSection>
  );
};

export default SeoSettingsSection;
