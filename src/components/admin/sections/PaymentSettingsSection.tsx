
import React from 'react';
import { CreditCard } from 'lucide-react';
import AdminSection from '@/components/admin/AdminSection';
import PaymentSettingsForm from '@/components/admin/PaymentSettingsForm';
import { useAdmin } from '@/contexts/admin';
import { usePaymentSettingsHandler } from '@/hooks/useSettingsHandlers';

const PaymentSettingsSection = () => {
  const { paymentSettingsForm, activeSections, toggleSection } = useAdmin();
  const { handlePaymentSettingsSubmit } = usePaymentSettingsHandler();

  // Transform the flat structure to the nested structure expected by PaymentSettingsForm
  const transformedData = {
    paylink: {
      enabled: paymentSettingsForm.paylinkEnabled,
      apiKey: paymentSettingsForm.paylinkApiKey,
      secretKey: paymentSettingsForm.paylinkSecretKey
    },
    paypal: {
      enabled: paymentSettingsForm.paypalEnabled,
      clientId: paymentSettingsForm.paypalClientId,
      secret: paymentSettingsForm.paypalSecret,
      sandbox: paymentSettingsForm.paypalSandbox
    }
  };

  return (
    <AdminSection 
      title="إعدادات بوابات الدفع" 
      description="تكوين بوابات الدفع PayLink.sa و PayPal"
      icon={CreditCard}
      isOpen={activeSections.paymentSettings}
      onToggle={() => toggleSection('paymentSettings')}
    >
      <PaymentSettingsForm 
        initialData={transformedData}
        onSubmit={handlePaymentSettingsSubmit}
      />
    </AdminSection>
  );
};

export default PaymentSettingsSection;
