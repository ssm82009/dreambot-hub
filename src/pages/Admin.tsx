
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    console.log("Admin dashboard mounted - fetching fresh data");
    
    setIsLoading(true);
    
    refreshAdminData()
      .then(() => {
        console.log("Admin data refresh completed");
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error refreshing admin data:", error);
        setIsLoading(false);
      });
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
      <div className="flex-1" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <SidebarProvider>
          <div className="flex flex-row-reverse w-full dream-pattern min-h-[calc(100vh-var(--footer-height)-var(--navbar-height))]">
            <main className="flex-1 p-6">
              <div className="w-full pb-8 admin-content">
                <AdminHeader />
                <AdminContent />
              </div>
            </main>
            <AdminSidebar />
          </div>
        </SidebarProvider>
      </div>
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
