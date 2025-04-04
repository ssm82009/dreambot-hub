import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { normalizePaymentStatus, isPendingPaymentStatus, PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';

export const useProfileData = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  
  const refreshUserData = async (userId: string) => {
    try {
      console.log("Refreshing user data for ID:", userId);
      
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
        
        const { count: dreamsCount, error: dreamsError } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        
        if (dreamsError) {
          console.error('Error refreshing dreams count:', dreamsError);
        }
        
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (paymentError) {
          console.error('Error refreshing payment data:', paymentError);
        } else {
          console.log("Refreshed payments:", paymentData);
          
          if (refreshedUserData.subscription_type && 
              refreshedUserData.subscription_type !== 'free' &&
              paymentData?.length > 0) {
            
            const pendingPayments = paymentData.filter(payment => 
              isPendingPaymentStatus(payment.status) && 
              (refreshedUserData.subscription_type === payment.plan_name)
            );
            
            if (pendingPayments.length > 0) {
              for (const payment of pendingPayments) {
                await supabase
                  .from('payment_invoices')
                  .update({ status: PAYMENT_STATUS.PAID })
                  .eq('id', payment.id);
                  
                console.log(`Fixed inconsistent payment status for ID ${payment.id}`);
              }
              
              const { data: updatedPayments } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
                
              if (updatedPayments) {
                const normalizedPayments = updatedPayments.map(payment => ({
                  ...payment,
                  status: normalizePaymentStatus(payment.status)
                }));
                
                setPayments(normalizedPayments);
                return;
              }
            }
          }
          
          const normalizedPayments = paymentData?.map(payment => ({
            ...payment,
            status: normalizePaymentStatus(payment.status)
          })) || [];
          
          setPayments(normalizedPayments);
        }
        
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
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      try {
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
        
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_invoices')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
          
        if (paymentError) {
          console.error('Error fetching payment data:', paymentError);
          setPayments([]);
        } else {
          console.log("Fetched payments for user:", session.user.id, paymentData);
          
          const normalizedPayments = paymentData?.map(payment => ({
            ...payment,
            status: normalizePaymentStatus(payment.status)
          })) || [];
          
          setPayments(normalizedPayments);
        }
        
        const { count: dreamsCount, error: dreamsError } = await supabase
          .from('dreams')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
          
        if (dreamsError) {
          console.error('Error fetching dreams count:', dreamsError);
        }
        
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
