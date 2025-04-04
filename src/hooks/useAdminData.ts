
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/admin';
import { useAdminAuth } from './admin/useAdminAuth';
import { useFetchDashboardStats } from './admin/useFetchDashboardStats';
import { useFetchSettings } from './admin/useFetchSettings';

export const useAdminData = () => {
  const { setIsLoading, setDbLoading, setUserCount, setDreams, setSubscriptions } = useAdmin();
  const { checkAdminAuth } = useAdminAuth();
  const { 
    totalUsers, 
    activeSubscriptions, 
    totalDreams, 
    totalTickets, 
    loading: statsLoading,
    fetchDashboardStats 
  } = useFetchDashboardStats();
  const { fetchAllSettings } = useFetchSettings();
  const navigate = useNavigate();
  
  // استخدام ref بدلاً من state لتتبع حالة التهيئة لتجنب إعادة التحميل
  const initializedRef = useRef(false);

  // Update context when stats change
  useEffect(() => {
    if (totalUsers !== undefined) setUserCount(totalUsers);
    if (totalDreams !== undefined) setDreams(totalDreams);
    if (activeSubscriptions !== undefined) setSubscriptions(activeSubscriptions);
    
    console.log("Dashboard stats updated in admin context:", {
      users: totalUsers,
      dreams: totalDreams,
      subscriptions: activeSubscriptions
    });
  }, [totalUsers, totalDreams, activeSubscriptions, setUserCount, setDreams, setSubscriptions]);

  // تهيئة بيانات المشرف
  useEffect(() => {
    // تجنب تنفيذ التهيئة أكثر من مرة
    if (initializedRef.current) {
      console.log("Admin data already initialized, skipping");
      return;
    }
    
    const initializeData = async () => {
      try {
        console.log("Initializing admin data...");
        setDbLoading(true);
        setIsLoading(true);
        
        const isAuthenticated = checkAdminAuth();
        
        // إذا لم يكن المستخدم مشرفًا، قم بتوجيهه إلى صفحة تسجيل الدخول
        if (!isAuthenticated) {
          console.log("User is not admin, redirecting to login");
          navigate('/login');
          return;
        }
        
        // إذا كان المستخدم مشرفًا، فقم بجلب البيانات من قاعدة البيانات
        await Promise.all([
          fetchDashboardStats(), 
          fetchAllSettings()
        ]);
        
        console.log("Admin data initialized successfully");
        
        // تعيين قيمة المرجع إلى true لمنع تكرار التهيئة
        initializedRef.current = true;
        
        // إنهاء حالة التحميل بعد اكتمال تحميل البيانات
        setDbLoading(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing admin data:", error);
        // إنهاء حالة التحميل حتى في حالة حدوث خطأ
        setDbLoading(false);
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []); // تقليل التبعيات لمنع إعادة التشغيل

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

  return {
    totalUsers,
    activeSubscriptions,
    totalDreams,
    totalTickets,
    statsLoading,
    fetchDashboardStats,
    fetchAllSettings,
    refreshAdminData
  };
};
