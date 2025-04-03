
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { AdminProvider, useAdmin } from '@/contexts/admin';
import { useAdminData } from '@/hooks/useAdminData';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminContent from '@/components/admin/AdminContent';

const AdminDashboard = () => {
  const { isLoading, setIsLoading } = useAdmin();
  const { fetchDashboardStats, fetchAllSettings } = useAdminData();

  // تحديث البيانات عند تحميل المكون
  useEffect(() => {
    console.log("Admin dashboard mounted - fetching fresh data");
    
    // تعيين حالة التحميل إلى true لضمان إعادة التحميل
    setIsLoading(true);
    
    // استدعاء الدوال لجلب أحدث البيانات
    const loadData = async () => {
      try {
        await fetchDashboardStats();
        await fetchAllSettings();
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        // إنهاء حالة التحميل بعد الانتهاء
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4 dream-pattern">
        <div className="container mx-auto">
          <AdminHeader />
          <AdminContent />
        </div>
      </main>
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
