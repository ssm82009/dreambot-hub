
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import { useAdminAuth } from './admin/useAdminAuth';
import { useFetchDashboardStats } from './admin/useFetchDashboardStats';
import { useFetchSettings } from './admin/useFetchSettings';

export const useAdminData = () => {
  const { setIsLoading, setDbLoading, setUserCount, setDreams, setSubscriptions, setOpenTickets } = useAdmin();
  const { checkAdminAuth } = useAdminAuth();
  const { 
    totalUsers, 
    activeSubscriptions, 
    totalDreams,
    totalTickets,
    openTickets,
    lastUpdated,
    loading: statsLoading,
    fetchDashboardStats 
  } = useFetchDashboardStats();
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
        
        await Promise.all([
          fetchDashboardStats(), 
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

  // مراقبة التغييرات في البيانات وتحديث السياق
  useEffect(() => {
    if (!statsLoading) { // Only update stats when not loading
      setUserCount(totalUsers);
      setDreams(totalDreams);
      setSubscriptions(activeSubscriptions);
      setOpenTickets(openTickets);
      console.log("Dashboard stats updated in admin context:", {
        users: totalUsers,
        dreams: totalDreams,
        subscriptions: activeSubscriptions,
        openTickets: openTickets,
        lastUpdated: lastUpdated.toISOString()
      });
    }
  }, [totalUsers, totalDreams, activeSubscriptions, openTickets, statsLoading, lastUpdated]);

  // Refresh admin data function with detailed logging
  const refreshAdminData = async () => {
    try {
      console.log("Manual refresh of admin data started");
      setDbLoading(true);
      
      console.log("Fetching dashboard stats...");
      await fetchDashboardStats();
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
    fetchDashboardStats,
    fetchAllSettings,
    refreshAdminData,
    statsLoading,
    lastUpdated
  };
};
