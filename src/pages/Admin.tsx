
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);
    setIsLoading(false);

    // Redirect non-admin users
    if (!adminStatus && !isLoading) {
      toast.error("يجب تسجيل الدخول كمشرف للوصول إلى لوحة التحكم");
      navigate('/login');
    }
  }, [navigate, isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    toast.success("تم تسجيل الخروج بنجاح");
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>جاري التحميل...</p>
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
          <div className="flex justify-between items-center mb-8 rtl">
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
              <p className="text-muted-foreground">مرحباً بك، {adminEmail}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>تسجيل الخروج</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rtl">
            <Card>
              <CardHeader>
                <CardTitle>الأحلام المقدمة</CardTitle>
                <CardDescription>إجمالي عدد الأحلام المقدمة للتفسير</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المستخدمين</CardTitle>
                <CardDescription>إجمالي عدد المستخدمين المسجلين</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الاشتراكات</CardTitle>
                <CardDescription>عدد الاشتراكات النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 rtl">
            <h2 className="text-2xl font-bold mb-6">الإحصائيات والأدوات</h2>
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أحدث التفسيرات</CardTitle>
                  <CardDescription>آخر التفسيرات المقدمة على المنصة</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">لا توجد تفسيرات بعد</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
