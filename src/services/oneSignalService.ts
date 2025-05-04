
// تعديل خدمة OneSignal لتكون المزود الرئيسي للإشعارات

// Define window._env type
declare global {
  interface Window {
    _env?: {
      ONESIGNAL_APP_ID?: string;
    };
  }
}

export class OneSignalService {
  private static instance: OneSignalService;
  private initialized: boolean = false;
  
  private constructor() {}
  
  public static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }
  
  async init(): Promise<boolean> {
    try {
      if (this.initialized) return true;
      
      if (!window.OneSignal) {
        console.warn('OneSignal not available on window object');
        return false;
      }
      
      await window.OneSignal.init({
        appId: window._env?.ONESIGNAL_APP_ID || '',
      });
      
      console.log('OneSignal service initialized');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      return false;
    }
  }
  
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.init();
      }
      
      if (!window.OneSignal) return false;
      
      const permission = await window.OneSignal.Notifications.permission;
      
      if (permission) {
        console.log('Notification permission already granted');
        return true;
      }
      
      const result = await window.OneSignal.Notifications.requestPermission();
      console.log('OneSignal notification permission result:', result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  async setExternalUserId(userId: string): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.init();
      }
      
      if (!window.OneSignal) return false;
      
      await window.OneSignal.login(userId);
      console.log('Set external user ID:', userId);
      return true;
    } catch (error) {
      console.error('Error setting external user ID:', error);
      return false;
    }
  }
  
  async removeExternalUserId(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.init();
      }
      
      if (!window.OneSignal) return false;
      
      await window.OneSignal.logout();
      console.log('Removed external user ID');
      return true;
    } catch (error) {
      console.error('Error removing external user ID:', error);
      return false;
    }
  }
}

// Create and export a default instance
const oneSignalService = OneSignalService.getInstance();

// Add a function to send notifications to admin
export const sendNotificationToAdmin = async (notification: any): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-onesignal-notification', {
      body: {
        notification,
        adminOnly: true
      }
    });
    
    if (error) {
      console.error('Error sending notification to admin:', error);
      return false;
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Exception sending notification to admin:', error);
    return false;
  }
};

export default oneSignalService;

import { supabase } from '@/integrations/supabase/client';
