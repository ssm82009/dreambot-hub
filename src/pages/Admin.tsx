
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
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { isLoading, dbLoading, setIsLoading } = useAdmin();
  const { refreshAdminData } = useAdminData();

  // تحديث البيانات عند تحميل المكون مع تحسين التسجيل
  useEffect(() => {
    console.log("Admin dashboard mounted - fetching fresh data");
    
    // تعيين حالة التحميل إلى true لضمان إعادة التحميل
    setIsLoading(true);
    
    // استدعاء الدالة لتحديث البيانات مع إدارة الأخطاء المحسنة
    refreshAdminData()
      .then(() => {
        console.log("Admin data refresh completed successfully");
        setIsLoading(false);
        toast.success("تم تحديث البيانات بنجاح");
      })
      .catch(error => {
        console.error("Error refreshing admin data:", error);
        setIsLoading(false);
        toast.error("حدث خطأ أثناء تحديث البيانات");
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
