
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import {
  Home,
  Settings,
  Users,
  FileText,
  Menu,
  CreditCard,
  PaintBucket,
  Search,
  LayoutDashboard,
  TicketCheck,
  CreditCard as TransactionIcon
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const { activeSections, setActiveSections, toggleSection } = useAdmin();
  const navigate = useNavigate();

  // تحقق ما إذا كان أي قسم مفعل باستثناء لوحة التحكم
  const isAnySectionActive = Object.entries(activeSections).some(
    ([key, value]) => key !== 'dashboard' && value === true
  );

  // دالة للتبديل بين الأقسام
  const handleSectionToggle = (sectionId: keyof typeof activeSections) => {
    // تعيين جميع الأقسام إلى false أولاً
    const resetSections: Record<string, boolean> = {};
    Object.keys(activeSections).forEach(key => {
      resetSections[key] = false;
    });
    
    // تفعيل القسم المحدد فقط
    setActiveSections({
      ...resetSections,
      [sectionId]: !activeSections[sectionId]
    });
  };

  // دالة للعودة إلى لوحة القيادة الرئيسية
  const handleDashboardClick = () => {
    // تعيين جميع الأقسام إلى false
    const resetSections: Record<string, boolean> = {};
    Object.keys(activeSections).forEach(key => {
      resetSections[key] = false;
    });
    
    setActiveSections(resetSections);
    navigate('/admin');
  };

  const menuSections = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: Home,
      action: handleDashboardClick
    },
    {
      id: 'aiSettings',
      label: 'إعدادات الذكاء الاصطناعي',
      icon: Settings,
      action: () => handleSectionToggle('aiSettings')
    },
    {
      id: 'interpretationSettings',
      label: 'إعدادات التفسير',
      icon: FileText,
      action: () => handleSectionToggle('interpretationSettings')
    },
    {
      id: 'pricingSettings',
      label: 'إعدادات الاشتراكات',
      icon: CreditCard,
      action: () => handleSectionToggle('pricingSettings')
    },
    {
      id: 'paymentSettings',
      label: 'إعدادات الدفع',
      icon: CreditCard,
      action: () => handleSectionToggle('paymentSettings')
    },
    {
      id: 'transactions',
      label: 'إدارة المعاملات',
      icon: TransactionIcon,
      action: () => handleSectionToggle('transactions')
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: Users,
      action: () => handleSectionToggle('users')
    },
    {
      id: 'pages',
      label: 'إدارة الصفحات',
      icon: LayoutDashboard,
      action: () => handleSectionToggle('pages')
    },
    {
      id: 'navbar',
      label: 'إدارة شريط التنقل',
      icon: Menu,
      action: () => handleSectionToggle('navbar')
    },
    {
      id: 'tickets',
      label: 'إدارة التذاكر',
      icon: TicketCheck,
      action: () => handleSectionToggle('tickets')
    },
    {
      id: 'theme',
      label: 'إعدادات المظهر',
      icon: PaintBucket,
      action: () => handleSectionToggle('theme')
    },
    {
      id: 'seo',
      label: 'إعدادات تحسين محركات البحث',
      icon: Search,
      action: () => handleSectionToggle('seo')
    },
    {
      id: 'homeSections',
      label: 'أقسام الصفحة الرئيسية',
      icon: LayoutDashboard,
      action: () => handleSectionToggle('homeSections')
    }
  ];

  return (
    <Sidebar className="border-l" variant="inset" side="right" dir="rtl">
      <SidebarHeader>
        <div className="flex items-center px-4 py-2">
          <span className="text-lg font-semibold">لوحة التحكم</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>الأقسام</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuSections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton 
                    onClick={section.action}
                    isActive={section.id === 'dashboard' ? !isAnySectionActive : activeSections[section.id as keyof typeof activeSections]}
                    tooltip={section.label}
                  >
                    <section.icon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">
          اصدار النظام: 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
