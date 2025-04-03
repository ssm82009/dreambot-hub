
import React from 'react';
import { Search } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import SeoSettingsForm from '@/components/admin/SeoSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { useSeoSettingsHandler } from '@/hooks/settings';

const SeoSettingsSection = () => {
  const { seoSettingsForm, activeSections, toggleSection } = useAdmin();
  const { updateSeoSettings, isUpdating, isSuccess } = useSeoSettingsHandler();

  return (
    <AdminSection 
      title="تحسين محركات البحث (SEO)" 
      description="إدارة إعدادات السيو والكلمات المفتاحية وخريطة الموقع"
      icon={Search}
      isOpen={activeSections.seoSettings}
      onToggle={() => toggleSection('seoSettings')}
    >
      <SeoSettingsForm 
        initialData={seoSettingsForm}
        onSubmit={updateSeoSettings}
        isLoading={isUpdating}
        isSuccess={isSuccess}
      />
    </AdminSection>
  );
};

export default SeoSettingsSection;
