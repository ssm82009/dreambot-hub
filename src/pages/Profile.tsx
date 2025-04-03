
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileWelcome from '@/components/profile/ProfileWelcome';
import ProfileSubscription from '@/components/profile/ProfileSubscription';
import ProfilePayments from '@/components/profile/ProfilePayments';
import ProfileDreams from '@/components/profile/ProfileDreams';
import ProfileSettings from '@/components/profile/ProfileSettings';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  
  // تحديث البيانات عند كل تبديل علامة تبويب
  const refreshUserData = async (userId: string) => {
    try {
      console.log("Refreshing user data for ID:", userId);
      
      // تحديث بيانات المستخدم
      const { data: refreshedUserData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error refreshing user data:', userError);
        return;
      }
      
      if (refreshedUserData) {
        console.log("Refreshed user data:", refreshedUserData);
        
        // تحديث عدد الأحلام
        const { count: dreamsCount, error: dreamsError } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (dreamsError) {
          console.error('Error refreshing dreams count:', dreamsError);
        }
        
        // تحديث المدفوعات
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (paymentError) {
          console.error('Error refreshing payment data:', paymentError);
        } else {
          console.log("Refreshed payments:", paymentData);
          setPayments(paymentData || []);
        }
        
        // تحديث بيانات المستخدم
        const session = await supabase.auth.getSession();
        setUserData({
          ...refreshedUserData,
          dreams_count: dreamsCount || 0,
          email: session.data.session?.user.email
        });
      }
    } catch (error) {
      console.error('Error in refreshing data:', error);
    }
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
      }
      
      try {
        // Fetch user data from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          toast({
            title: "خطأ في تحميل البيانات",
            description: "حدث خطأ أثناء تحميل بيانات المستخدم، يرجى المحاولة مرة أخرى.",
            variant: "destructive"
          });
          throw userError;
        }
        
        console.log("Fetched user data:", userData);
        
        // Fetch payment invoices separately - make sure we only fetch the current user's payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (paymentError) {
          console.error('Error fetching payment data:', paymentError);
          // Continue without payment data
          setPayments([]);
        } else {
          console.log("Fetched payments for user:", session.user.id, paymentData);
          setPayments(paymentData || []);
        }
        
        // Fetch user dreams count
        const { count: dreamsCount, error: dreamsError } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
          
        if (dreamsError) {
          console.error('Error fetching dreams count:', dreamsError);
        }
        
        // Set combined user data
        setUserData({
          ...userData,
          dreams_count: dreamsCount || 0,
          email: session.user.email
        });
      } catch (error) {
        console.error('Error in profile data loading:', error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل البيانات، يرجى المحاولة مرة أخرى.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // تحديث البيانات عند تغيير علامة التبويب
  const handleTabChange = (value: string) => {
    if (userData?.id) {
      refreshUserData(userData.id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الملف الشخصي...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
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
          
          <Tabs defaultValue="subscription" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              <TabsTrigger value="dreams">الأحلام</TabsTrigger>
              <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <ProfileSubscription userData={userData} />
            </TabsContent>
            
            <TabsContent value="payments">
              <ProfilePayments payments={payments} />
            </TabsContent>
            
            <TabsContent value="dreams">
              <ProfileDreams userId={userData?.id} dreamsCount={userData?.dreams_count} />
            </TabsContent>
            
            <TabsContent value="settings">
              <ProfileSettings userId={userData?.id} userEmail={userData?.email} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
