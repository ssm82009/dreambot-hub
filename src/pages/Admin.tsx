
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { AdminProvider, useAdmin } from '@/contexts/admin';
import { useAdminData } from '@/hooks/useAdminData';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminContent from '@/components/admin/AdminContent';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const AdminDashboard = () => {
  const { isLoading, dbLoading, setIsLoading } = useAdmin();
  const { refreshAdminData } = useAdminData();
  const location = useLocation();

  // إعادة تعيين موضع التمرير للأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // تحديث البيانات عند تحميل المكون
  useEffect(() => {
    console.log("Admin dashboard mounted - fetching fresh data");
    
    // تعيين حالة التحميل إلى true لضمان إعادة التحميل
    setIsLoading(true);
    
    // استدعاء الدالة لتحديث البيانات وإجبار التحديث عن طريق استخدام noCache
    refreshAdminData()
      .then(() => {
        console.log("Admin data refresh completed");
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error refreshing admin data:", error);
        setIsLoading(false);
      });

    // إضافة مؤقت لتحديث البيانات كل دقيقة
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing admin data");
      refreshAdminData().catch(error => {
        console.error("Error auto-refreshing admin data:", error);
      });
    }, 60000); // تحديث كل دقيقة

    return () => {
      clearInterval(intervalId); // تنظيف المؤقت عند إزالة المكون
    };
  }, []);

  if (isLoading || dbLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SidebarProvider>
        <div className="min-h-screen flex flex-row-reverse w-full dream-pattern" dir="rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <AdminSidebar />
          <main className="flex-1 p-4 mr-[16rem]">
            <div className="w-full pr-0">
              <AdminHeader />
              <AdminContent />
            </div>
          </main>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
};

const Admin = () => {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  );
};

export default Admin;
