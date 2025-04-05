
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
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

  // تحديث البيانات عند تحميل المكون
  useEffect(() => {
    console.log("Admin dashboard mounted - fetching fresh data");
    
    // تعيين حالة التحميل إلى true لضمان إعادة التحميل
    setIsLoading(true);
    
    // استدعاء الدالة لتحديث البيانات
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
        <main className="flex-1 flex items-center justify-center">
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
        <div className="min-h-screen flex flex-row-reverse w-full pt-16 dream-pattern" dir="rtl">
          <AdminSidebar />
          <main className="flex-1 p-4 mr-64">
            <div className="container mx-auto">
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
