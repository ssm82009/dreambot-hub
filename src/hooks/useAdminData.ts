
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import { useAdminAuth } from './admin/useAdminAuth';
import { useFetchDashboardStats } from './admin/useFetchDashboardStats';
import { useFetchSettings } from './admin/useFetchSettings';

export const useAdminData = () => {
  const { setIsLoading, setDbLoading } = useAdmin();
  const { checkAdminAuth } = useAdminAuth();
  const { fetchDashboardStats } = useFetchDashboardStats();
  const { fetchAllSettings } = useFetchSettings();

  // تهيئة بيانات المشرف
  useEffect(() => {
    const isAuthenticated = checkAdminAuth();
    
    // إذا كان المستخدم مشرفًا، فقم بجلب البيانات من قاعدة البيانات
    if (isAuthenticated) {
      const initializeData = async () => {
        try {
          setDbLoading(true);
          await Promise.all([
            fetchDashboardStats(), 
            fetchAllSettings()
          ]);
        } catch (error) {
          console.error("Error initializing admin data:", error);
        } finally {
          setDbLoading(false);
          setIsLoading(false);
        }
      };
      
      initializeData();
    }
  }, []);

  // تصدير الدوال لإعادة تحميل البيانات عند الحاجة
  return {
    fetchDashboardStats,
    fetchAllSettings
  };
};
