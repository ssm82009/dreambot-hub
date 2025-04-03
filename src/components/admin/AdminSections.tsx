
import React from 'react';
import AiSettingsSection from '@/components/admin/sections/AiSettingsSection';
import InterpretationSettingsSection from '@/components/admin/sections/InterpretationSettingsSection';
import PricingSettingsSection from '@/components/admin/sections/PricingSettingsSection';
import PaymentSettingsSection from '@/components/admin/sections/PaymentSettingsSection';
import UserManagementSection from '@/components/admin/sections/UserManagementSection';
import PageManagementSection from '@/components/admin/sections/PageManagementSection';
import NavbarManagementSection from '@/components/admin/sections/NavbarManagementSection';
import TransactionManagementSection from '@/components/admin/sections/TransactionManagementSection';
import TicketManagementSection from '@/components/admin/sections/TicketManagementSection';
import ThemeSettingsSection from '@/components/admin/sections/ThemeSettingsSection';

const AdminSections: React.FC = () => {
  return (
    <div className="rtl">
      <h2 className="text-2xl font-bold mb-6">إعدادات النظام</h2>
      
      <AiSettingsSection />
      <InterpretationSettingsSection />
      <PricingSettingsSection />
      <PaymentSettingsSection />
      <TransactionManagementSection />
      <UserManagementSection />
      <PageManagementSection />
      <NavbarManagementSection />
      <TicketManagementSection />
      <ThemeSettingsSection />
    </div>
  );
};

export default AdminSections;
