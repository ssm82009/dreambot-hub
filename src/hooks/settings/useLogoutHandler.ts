
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Unified logout handler for both admin and regular users
export const useLogoutHandler = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    
    // Notify the user
    toast.success("تم تسجيل الخروج بنجاح");
    
    // Redirect to login page
    navigate('/login');
  };

  return { handleLogout };
};
