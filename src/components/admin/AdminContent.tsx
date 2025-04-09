
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
  
  // الحصول على القسم النشط الوحيد إن وجد
  const getActiveSection = () => {
    const activeSectionKey = Object.keys(activeSections).find(
      key => activeSections[key as keyof typeof activeSections] === true
    );
    return activeSectionKey;
  };
  
  const activeSection = getActiveSection();
  
  // عرض الإحصائيات إذا لم يكن هناك قسم نشط
  const showDashboard = !activeSection || activeSection === 'dashboard';

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
          {/* عرض الإحصائيات فقط إذا لم يكن هناك قسم آخر نشط */}
          {showDashboard && <DashboardStatsSection />}
          
          {/* عرض القسم المحدد فقط */}
          {activeSection === 'aiSettings' && <AiSettingsSection />}
          {activeSection === 'interpretationSettings' && <InterpretationSettingsSection />}
          {activeSection === 'pricingSettings' && <PricingSettingsSection />}
          {activeSection === 'paymentSettings' && <PaymentSettingsSection />}
          {activeSection === 'users' && <UserManagementSection />}
          {activeSection === 'pages' && <PageManagementSection />}
          {activeSection === 'navbar' && <NavbarManagementSection />}
          {activeSection === 'transactions' && <TransactionManagementSection />}
          {activeSection === 'tickets' && <TicketManagementSection />}
          {activeSection === 'theme' && <ThemeSettingsSection />}
          {activeSection === 'seo' && <SeoSettingsSection />}
          {activeSection === 'homeSections' && <HomeSectionsSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'dreams' && <DreamManagementSection />}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
