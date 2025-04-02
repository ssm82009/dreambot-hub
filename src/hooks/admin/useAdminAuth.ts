import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/admin';

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const {
    setIsAdmin,
    setAdminEmail,
    setIsLoading,
  } = useAdmin();

  // Check admin authentication status
  const checkAdminAuth = () => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAdmin(adminStatus);
    setAdminEmail(email);

    if (!adminStatus) {
      setIsLoading(false);
      toast.error("يجب تسجيل الدخول كمشرف للوصول إلى لوحة التحكم");
      navigate('/login');
      return false;
    }
    
    return true;
  };

  return { checkAdminAuth };
};
