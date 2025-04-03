
import React from 'react';
import { PenSquare } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import InterpretationSettingsForm from '@/components/admin/InterpretationSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { useInterpretationSettingsHandler } from '@/hooks/useSettingsHandlers';

const InterpretationSettingsSection = () => {
  const { interpretationSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handleInterpretationSettingsSubmit } = useInterpretationSettingsHandler();

  return (
    <AdminSection 
      title="إعدادات التفسير" 
      description="إعدادات عدد الكلمات المسموح بها للمدخلات والمخرجات"
      icon={PenSquare}
      isOpen={activeSections.interpretationSettings}
      onToggle={() => toggleSection('interpretationSettings')}
    >
      <InterpretationSettingsForm 
        initialData={interpretationSettingsForm}
        onSubmit={handleInterpretationSettingsSubmit}
      />
    </AdminSection>
  );
};

export default InterpretationSettingsSection;
