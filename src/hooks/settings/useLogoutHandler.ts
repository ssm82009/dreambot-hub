
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Logout handler
export const useLogoutHandler = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('userEmail');
    toast.success("تم تسجيل الخروج بنجاح");
    navigate('/login');
  };

  return { handleLogout };
};
