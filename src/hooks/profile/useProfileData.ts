import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { normalizePaymentStatus } from '@/utils/payment/statusNormalizer';

export const useProfileData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  
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
          
          // استخدم دالة التطبيع مباشرة بدون تغيير إضافي
          const normalizedPayments = paymentData?.map(payment => {
            return {
              ...payment,
              status: normalizePaymentStatus(payment.status)
            };
          }) || [];
          
          setPayments(normalizedPayments);
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
          
          // استخدم دالة التطبيع مباشرة بدون تغيير إضافي
          const normalizedPayments = paymentData?.map(payment => {
            return {
              ...payment,
              status: normalizePaymentStatus(payment.status)
            };
          }) || [];
          
          setPayments(normalizedPayments);
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
  
  return {
    isLoading,
    userData,
    payments,
    refreshUserData
  };
};
