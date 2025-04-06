
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/admin';
import DashboardStats from '@/components/admin/DashboardStats';
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
import SeoSettingsSection from '@/components/admin/sections/SeoSettingsSection';
import HomeSectionsSection from '@/components/admin/sections/HomeSectionsSection';
import DatabaseSettingsSection from '@/components/admin/sections/DatabaseSettingsSection';

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
          {!isAnySectionActive && <DashboardStats />}
          
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
          {activeSections.database && <DatabaseSettingsSection />}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
