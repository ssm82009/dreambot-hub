
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
  const { activeSections, toggleSection } = useAdmin();
  const navigate = useNavigate();

  const menuSections = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: Home,
      action: () => navigate('/admin')
    },
    {
      id: 'aiSettings',
      label: 'إعدادات الذكاء الاصطناعي',
      icon: Settings,
      action: () => toggleSection('aiSettings')
    },
    {
      id: 'interpretationSettings',
      label: 'إعدادات التفسير',
      icon: FileText,
      action: () => toggleSection('interpretationSettings')
    },
    {
      id: 'pricingSettings',
      label: 'إعدادات الاشتراكات',
      icon: CreditCard,
      action: () => toggleSection('pricingSettings')
    },
    {
      id: 'paymentSettings',
      label: 'إعدادات الدفع',
      icon: CreditCard,
      action: () => toggleSection('paymentSettings')
    },
    {
      id: 'transactions',
      label: 'إدارة المعاملات',
      icon: TransactionIcon,
      action: () => toggleSection('transactions')
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: Users,
      action: () => toggleSection('users')
    },
    {
      id: 'pages',
      label: 'إدارة الصفحات',
      icon: LayoutDashboard,
      action: () => toggleSection('pages')
    },
    {
      id: 'navbar',
      label: 'إدارة شريط التنقل',
      icon: Menu,
      action: () => toggleSection('navbar')
    },
    {
      id: 'tickets',
      label: 'إدارة التذاكر',
      icon: TicketCheck,
      action: () => toggleSection('tickets')
    },
    {
      id: 'theme',
      label: 'إعدادات المظهر',
      icon: PaintBucket,
      action: () => toggleSection('theme')
    },
    {
      id: 'seo',
      label: 'إعدادات تحسين محركات البحث',
      icon: Search,
      action: () => toggleSection('seo')
    },
    {
      id: 'homeSections',
      label: 'أقسام الصفحة الرئيسية',
      icon: LayoutDashboard,
      action: () => toggleSection('homeSections')
    }
  ];

  return (
    <Sidebar className="border-l" variant="inset">
      <SidebarHeader>
        <div className="flex items-center px-4 py-2">
          <span className="text-lg font-semibold">لوحة التحكم</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="rtl">
        <SidebarGroup>
          <SidebarGroupLabel>الأقسام</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuSections.map((section) => (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton 
                    onClick={section.action}
                    isActive={section.id === 'dashboard' ? true : activeSections[section.id]}
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
