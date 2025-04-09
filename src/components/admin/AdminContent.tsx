
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import DashboardStatsSection from './sections/DashboardStats';
import AiSettingsSection from './sections/AiSettingsSection';
import InterpretationSettingsSection from './sections/InterpretationSettingsSection';
import PricingSettingsSection from './sections/PricingSettingsSection';
import PaymentSettingsSection from './sections/PaymentSettingsSection';
import UserManagementSection from './sections/UserManagementSection';
import PageManagementSection from './sections/PageManagementSection';
import NavbarManagementSection from './sections/NavbarManagementSection';
import TransactionManagementSection from './sections/TransactionManagementSection';
import TicketManagementSection from './sections/TicketManagementSection';
import ThemeSettingsSection from './sections/ThemeSettingsSection';
import SeoSettingsSection from './sections/SeoSettingsSection';
import HomeSectionsSection from './sections/HomeSectionsSection';
import NotificationsSection from './sections/NotificationsSection';
import DreamManagementSection from './sections/DreamManagementSection';

const AdminContent: React.FC = () => {
  const { dbLoading, activeSections } = useAdmin();
  
  // تحقق ما إذا كان أي قسم مفعل باستثناء لوحة التحكم
  const isAnySectionActive = Object.entries(activeSections).some(
    ([key, value]) => key !== 'dashboard' && value === true
  );

  return (
    <div className="mt-4">
      {dbLoading ? (
        <div className="flex justify-center my-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* الإحصائيات تظهر فقط إذا لم يكن هناك أي قسم آخر مفعل */}
          {!isAnySectionActive && <DashboardStatsSection />}
          
          {/* عرض القسم المحدد فقط */}
          {activeSections.aiSettings && <AiSettingsSection />}
          {activeSections.interpretationSettings && <InterpretationSettingsSection />}
          {activeSections.pricingSettings && <PricingSettingsSection />}
          {activeSections.paymentSettings && <PaymentSettingsSection />}
          {activeSections.users && <UserManagementSection />}
          {activeSections.pages && <PageManagementSection />}
          {activeSections.navbar && <NavbarManagementSection />}
          {activeSections.transactions && <TransactionManagementSection />}
          {activeSections.tickets && <TicketManagementSection />}
          {activeSections.theme && <ThemeSettingsSection />}
          {activeSections.seo && <SeoSettingsSection />}
          {activeSections.homeSections && <HomeSectionsSection />}
          {activeSections.notifications && <NotificationsSection />}
          {activeSections.dreams && <DreamManagementSection />}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
