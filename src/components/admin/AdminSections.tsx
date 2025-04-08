import React from 'react';
import DashboardStats from './sections/DashboardStats';
import AiSettingsSection from './sections/AiSettingsSection';
import InterpretationSettingsSection from './sections/InterpretationSettingsSection';
import PricingSettingsSection from './sections/PricingSettingsSection';
import PaymentSettingsSection from './sections/PaymentSettingsSection';
import UserManagementSection from './sections/UserManagementSection';
import PageManagementSection from './sections/PageManagementSection';
import NavbarManagementSection from './sections/NavbarManagementSection';
import TicketManagementSection from './sections/TicketManagementSection';
import TransactionManagementSection from './sections/TransactionManagementSection';
import ThemeSettingsSection from './sections/ThemeSettingsSection';
import SeoSettingsSection from './sections/SeoSettingsSection';
import HomeSectionsSection from './sections/HomeSectionsSection';
import { useAdmin } from '@/contexts/admin';
import NotificationsSection from './sections/NotificationsSection';

// Inside the AdminSections component
const AdminSections: React.FC = () => {
  const { 
    activeSections,
    aiSettingsForm, 
    interpretationSettingsForm,
    pricingSettingsForm,
    paymentSettingsForm,
  } = useAdmin();
  
  return (
    <div className="w-full">
      {/* Existing sections */}
      {activeSections.aiSettings && <AiSettingsSection />}
      {activeSections.interpretationSettings && <InterpretationSettingsSection />}
      {activeSections.pricingSettings && <PricingSettingsSection />}
      {activeSections.paymentSettings && <PaymentSettingsSection />}
      {activeSections.users && <UserManagementSection />}
      {activeSections.pages && <PageManagementSection />}
      {activeSections.navbar && <NavbarManagementSection />}
      {activeSections.tickets && <TicketManagementSection />}
      {activeSections.transactions && <TransactionManagementSection />}
      {activeSections.theme && <ThemeSettingsSection />}
      {activeSections.seo && <SeoSettingsSection />}
      {activeSections.homeSections && <HomeSectionsSection />}
      {activeSections.notifications && <NotificationsSection />}
      
      {/* If no section is active, show dashboard */}
      {!Object.values(activeSections).some(Boolean) && <DashboardStats />}
    </div>
  );
};

export default AdminSections;
