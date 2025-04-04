
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import { useAdminAuth } from './admin/useAdminAuth';
import { useFetchDashboardStats } from './admin/useFetchDashboardStats';
import { useFetchSettings } from './admin/useFetchSettings';

export const useAdminData = () => {
  const { setIsLoading, setDbLoading } = useAdmin();
  const { checkAdminAuth } = useAdminAuth();
  const dashboardStatsHook = useFetchDashboardStats(); // Proper naming for clarity
  const { fetchAllSettings } = useFetchSettings();
  const navigate = useNavigate();

  // تهيئة بيانات المشرف
  useEffect(() => {
    const isAuthenticated = checkAdminAuth();
    
    // إذا لم يكن المستخدم مشرفًا، قم بتوجيهه إلى صفحة تسجيل الدخول
    if (!isAuthenticated) {
      console.log("User is not admin, redirecting to login");
      navigate('/login');
      return;
    }
    
    // إذا كان المستخدم مشرفًا، فقم بجلب البيانات من قاعدة البيانات
    const initializeData = async () => {
      try {
        console.log("Initializing admin data...");
        setDbLoading(true);
        
        // Create a custom fetchDashboardStats function
        const fetchStats = async () => {
          try {
            // We use the hook result but manually execute the fetch logic
            // This is a workaround since the hook returns data but we need a function
            const fetchData = await fetch('/api/admin/stats');
            const data = await fetchData.json();
            return data;
          } catch (error) {
            console.error("Error fetching dashboard stats:", error);
          }
        };
        
        await Promise.all([
          fetchStats(), 
          fetchAllSettings()
        ]);
        console.log("Admin data initialized successfully");
      } catch (error) {
        console.error("Error initializing admin data:", error);
      } finally {
        setDbLoading(false);
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Define fetchStats function at the module level to avoid the undefined reference
  const fetchStats = async () => {
    try {
      const fetchData = await fetch('/api/admin/stats');
      const data = await fetchData.json();
      return data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  // Refresh admin data function with detailed logging
  const refreshAdminData = async () => {
    try {
      console.log("Manual refresh of admin data started");
      setDbLoading(true);
      
      console.log("Fetching dashboard stats...");
      await fetchStats();
      console.log("Dashboard stats fetched successfully");
      
      console.log("Fetching all settings...");
      await fetchAllSettings();
      console.log("All settings fetched successfully");
      
      console.log("Admin data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing admin data:", error);
    } finally {
      setDbLoading(false);
    }
  };

  // تصدير الدوال لإعادة تحميل البيانات عند الحاجة
  return {
    fetchDashboardStats: fetchStats,
    fetchAllSettings,
    refreshAdminData
  };
};
