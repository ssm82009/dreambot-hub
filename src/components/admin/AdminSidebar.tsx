
import React from 'react';
import { useAdmin } from '@/contexts/admin';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Brain, 
  BookText, 
  DollarSign, 
  CreditCard, 
  Users, 
  FileText, 
  Menu, 
  ShoppingCart, 
  TicketCheck, 
  Palette, 
  Search, 
  LayoutDashboard, 
  Bell,
  Book,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';

interface MenuItem {
  name: string;
  section: keyof typeof initialSections;
  icon: React.ElementType;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

// Bring initialSections here
const initialSections = {
  dashboard: true,
  aiSettings: false,
  interpretationSettings: false,
  pricingSettings: false,
  paymentSettings: false,
  users: false,
  pages: false,
  navbar: false,
  transactions: false,
  tickets: false,
  theme: false,
  seo: false,
  homeSections: false,
  notifications: false,
  dreams: false,
};

const AdminSidebar: React.FC = () => {
  const { activeSections, setActiveSections } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();

  // تحقق ما إذا كان القسم نشطًا
  const isActive = (section: keyof typeof initialSections): boolean => {
    return activeSections[section as keyof typeof activeSections] || false;
  };

  // تبديل حالة القسم المحدد وضبط جميع الأقسام الأخرى على عدم النشاط
  const selectSection = (section: keyof typeof initialSections) => {
    const newSections = { ...initialSections };
    
    // إعادة تعيين جميع الأقسام إلى 'false'
    Object.keys(newSections).forEach(key => {
      newSections[key as keyof typeof initialSections] = false;
    });
    
    // تفعيل القسم المحدد فقط
    if (section !== 'dashboard') {
      newSections[section] = true;
    }
    
    setActiveSections(newSections);
    navigate(`/admin?section=${section}`);
  };

  const menuItems: MenuCategory[] = [
    {
      category: "الرئيسية",
      items: [
        { 
          name: "لوحة التحكم", 
          section: "dashboard", 
          icon: LayoutDashboard 
        },
      ]
    },
    {
      category: "المحتوى",
      items: [
        { 
          name: "الأحلام", 
          section: "dreams", 
          icon: Book 
        },
        { 
          name: "الإشعارات", 
          section: "notifications", 
          icon: Bell 
        },
        { 
          name: "الصفحات", 
          section: "pages", 
          icon: FileText 
        },
        { 
          name: "القائمة العلوية", 
          section: "navbar", 
          icon: Menu 
        },
        { 
          name: "أقسام الصفحة الرئيسية", 
          section: "homeSections", 
          icon: LayoutDashboard 
        },
      ]
    },
    {
      category: "الإعدادات",
      items: [
        { 
          name: "إعدادات الذكاء الاصطناعي", 
          section: "aiSettings", 
          icon: Brain 
        },
        { 
          name: "إعدادات التفسير", 
          section: "interpretationSettings", 
          icon: BookText 
        },
        { 
          name: "إعدادات التسعير", 
          section: "pricingSettings", 
          icon: DollarSign 
        },
        { 
          name: "إعدادات الدفع", 
          section: "paymentSettings", 
          icon: CreditCard 
        },
        { 
          name: "إدارة المستخدمين", 
          section: "users", 
          icon: Users 
        },
        { 
          name: "إدارة الاشتراكات", 
          section: "transactions", 
          icon: ShoppingCart 
        },
        { 
          name: "إدارة التذاكر", 
          section: "tickets", 
          icon: TicketCheck 
        },
        { 
          name: "إعدادات المظهر", 
          section: "theme", 
          icon: Palette 
        },
        { 
          name: "إعدادات SEO", 
          section: "seo", 
          icon: Search 
        },
      ]
    },
  ];

  return (
    <Sidebar className="bg-white" variant="sidebar" side="left">
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold">لوحة التحكم</h2>
          <button 
            onClick={toggleSidebar} 
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
          >
            {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((category, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>{category.category}</SidebarGroupLabel>
            <SidebarMenu>
              {category.items.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    isActive={isActive(item.section)}
                    tooltip={item.name}
                    onClick={() => selectSection(item.section)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground text-center">
          نظام إدارة تفسير الأحلام الإصدار 1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
