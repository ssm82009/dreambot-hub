
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import { useAdminAuth } from './admin/useAdminAuth';
import { useFetchDashboardStats } from './admin/useFetchDashboardStats';
import { useFetchSettings } from './admin/useFetchSettings';

export const useAdminData = () => {
  const { setIsLoading } = useAdmin();
  const { checkAdminAuth } = useAdminAuth();
  const { fetchDashboardStats } = useFetchDashboardStats();
  const { fetchAllSettings } = useFetchSettings();

  // Initialize admin data
  useEffect(() => {
    const isAuthenticated = checkAdminAuth();
    
    // If user is admin, fetch data from database
    if (isAuthenticated) {
      fetchDashboardStats();
      fetchAllSettings();
      setIsLoading(false);
    }
  }, []);

  return {
    fetchDashboardStats,
    fetchAllSettings
  };
};
