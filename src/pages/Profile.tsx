
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileWelcome from '@/components/profile/ProfileWelcome';
import ProfileLoading from '@/components/profile/ProfileLoading';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { useProfileData } from '@/hooks/profile/useProfileData';

const Profile = () => {
  const { isLoading, userData, payments, refreshUserData } = useProfileData();
  
  // تحديث البيانات عند تغيير علامة التبويب
  const handleTabChange = (value: string) => {
    if (userData?.id) {
      refreshUserData(userData.id);
    }
  };
  
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
      <main className="flex-1 py-20 px-4 rtl">
        <div className="container mx-auto">
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
