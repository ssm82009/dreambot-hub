
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Unified logout handler for both admin and regular users
export const useLogoutHandler = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      
      // Notify the user
      toast.success("تم تسجيل الخروج بنجاح");
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Force reload to ensure auth state is reset
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return { handleLogout };
};
