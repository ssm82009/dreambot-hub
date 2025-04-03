
import React from 'react';
import { CreditCard } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { usePaymentSettingsHandler } from '@/hooks/useSettingsHandlers';

const PaymentSettingsSection = () => {
  const { paymentSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handlePaymentSettingsSubmit } = usePaymentSettingsHandler();

  return (
    <AdminSection 
      title="إعدادات بوابات الدفع" 
      description="تكوين بوابات الدفع PayLink.sa و PayPal"
      icon={CreditCard}
      isOpen={activeSections.paymentSettings}
      onToggle={() => toggleSection('paymentSettings')}
    >
      <PaymentSettingsForm 
        initialData={paymentSettingsForm}
        onSubmit={handlePaymentSettingsSubmit}
      />
    </AdminSection>
  );
};

export default PaymentSettingsSection;
