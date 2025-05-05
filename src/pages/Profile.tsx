
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileWelcome from '@/components/profile/ProfileWelcome';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { useProfileData } from '@/hooks/profile/useProfileData';

const Profile = () => {
  const { isLoading, userData, payments, refreshUserData } = useProfileData();
  const location = useLocation();
  
  // تحديث البيانات عند تغيير علامة التبويب
  const handleTabChange = (value: string) => {
    if (userData?.id) {
      refreshUserData(userData.id);
    }
  };
  
  // إعادة تعيين موضع التمرير للأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // تحديث البيانات عند تحميل الصفحة
  useEffect(() => {
    // إذا كان هناك بيانات للمستخدم، قم بتحديثها
    if (userData?.id) {
      refreshUserData(userData.id);
    }
  }, [userData?.id, refreshUserData]);
  
  if (isLoading) {
    return <ProfileLoading />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto py-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">الملف الشخصي</CardTitle>
              <CardDescription>
                مرحباً بك في صفحة ملفك الشخصي، يمكنك هنا إدارة حسابك وإشتراكاتك وتصفح سجلاتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileWelcome userData={userData} />
            </CardContent>
          </Card>
          
          <ProfileTabs 
            userData={userData} 
            payments={payments} 
            onTabChange={handleTabChange} 
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
