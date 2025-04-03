
import React from 'react';
import { Palette } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import ThemeSettingsForm from '@/components/admin/ThemeSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { useThemeSettingsHandler } from '@/hooks/useSettingsHandlers';

const ThemeSettingsSection = () => {
  const { themeSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handleThemeSettingsSubmit } = useThemeSettingsHandler();

  return (
    <AdminSection 
      title="إعدادات المظهر" 
      description="تخصيص ألوان الموقع واللوجو والهيدر والفوتر"
      icon={Palette}
      isOpen={activeSections.themeSettings}
      onToggle={() => toggleSection('themeSettings')}
    >
      <ThemeSettingsForm 
        initialData={themeSettingsForm}
        onSubmit={handleThemeSettingsSubmit}
      />
    </AdminSection>
  );
};

export default ThemeSettingsSection;
