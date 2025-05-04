
// تعديل خدمة OneSignal لتكون المزود الرئيسي للإشعارات

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
        notifyButton: {
          enable: false
        },
        allowLocalhostAsSecureOrigin: true
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
      
      if (window.OneSignal.Notifications) {
        return await window.OneSignal.Notifications.requestPermission();
      } else {
        // Fallback to older API for compatibility
        const permission = await window.OneSignal.getNotificationPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission already granted');
          return true;
        }
        
        const result = await window.OneSignal.showNativePrompt();
        console.log('OneSignal native prompt result:', result);
        return result !== 'denied';
      }
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
      
      if (window.OneSignal.User) {
        // New API
        await window.OneSignal.login(userId);
      } else {
        // Legacy API
        await window.OneSignal.setExternalUserId(userId);
      }
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
      
      if (window.OneSignal.User) {
        // New API
        await window.OneSignal.logout();
      } else {
        // Legacy API
        await window.OneSignal.removeExternalUserId();
      }
      
      console.log('Removed external user ID');
      return true;
    } catch (error) {
      console.error('Error removing external user ID:', error);
      return false;
    }
  }
}

// Create and export a default instance
export default OneSignalService.getInstance();
