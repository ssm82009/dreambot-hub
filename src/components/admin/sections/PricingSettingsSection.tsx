
import React from 'react';
import { DollarSign } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import PricingSettingsForm from '@/components/admin/PricingSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { usePricingSettingsHandler } from '@/hooks/useSettingsHandlers';

const PricingSettingsSection = () => {
  const { pricingSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handlePricingSettingsSubmit } = usePricingSettingsHandler();

  return (
    <AdminSection 
      title="إعدادات الخطط والأسعار" 
      description="تكوين خطط الاشتراك والأسعار"
      icon={DollarSign}
      isOpen={activeSections.pricingSettings}
      onToggle={() => toggleSection('pricingSettings')}
    >
      <PricingSettingsForm 
        initialData={pricingSettingsForm}
        onSubmit={handlePricingSettingsSubmit}
      />
    </AdminSection>
  );
};

export default PricingSettingsSection;
