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
  Book
} from 'lucide-react';

interface MenuItem {
  name: string;
  section: string;
  icon: React.ElementType;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

const AdminSidebar: React.FC = () => {
  const { activeSections, toggleSection } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (section: string): boolean => {
    return location.pathname.includes(section);
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
    <aside className="w-[16rem] h-screen bg-secondary border-l border-secondary-foreground/10 fixed top-0 right-0 z-20">
      <div className="p-4">
        <h2 className="text-lg font-bold">لوحة التحكم</h2>
      </div>
      <nav className="flex flex-col space-y-1">
        {menuItems.map((category, index) => (
          <div key={index} className="space-y-1">
            <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">{category.category}</div>
            {category.items.map((item) => (
              <button
                key={item.section}
                className={cn(
                  "flex items-center w-full p-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary-foreground/10",
                  activeSections[item.section] && "bg-secondary-foreground/10",
                  isActive(item.section) && "bg-secondary-foreground/10",
                )}
                onClick={() => {
                  toggleSection(item.section);
                  navigate(`/admin?section=${item.section}`);
                }}
              >
                <item.icon className="w-4 h-4 ml-2" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
