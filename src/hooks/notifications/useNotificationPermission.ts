
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface NotificationPermissionState {
  granted: boolean;
  supported: boolean;
}

/**
 * هوك للتحقق من إذن الإشعارات
 */
export function useNotificationPermission() {
  const [state, setState] = useState<NotificationPermissionState>({
    granted: false,
    supported: false
  });

  // تحقق من دعم الإشعارات
  useEffect(() => {
    const checkNotificationSupport = async () => {
      const supported = 'Notification' in window && 
                        'serviceWorker' in navigator && 
                        'PushManager' in window;
      
      if (supported) {
        const permission = Notification.permission;
        const granted = permission === 'granted';
        
        setState({
          granted,
          supported
        });
      } else {
        setState({
          granted: false,
          supported
        });
      }
    };
    
    checkNotificationSupport();
  }, []);

  /**
   * طلب إذن الإشعارات
   */
  const requestPermission = async () => {
    if (!state.supported) {
      toast.error('متصفحك لا يدعم الإشعارات');
      return false;
    }
    
    try {
      console.log("طلب إذن الإشعارات...");
      
      if (Notification.permission === 'denied') {
        toast.error('تم رفض الإشعارات من قبل المتصفح. يرجى تمكين الإشعارات من إعدادات المتصفح.');
        console.log("الإشعارات مرفوضة من قبل المتصفح");
        return false;
      }
      
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      
      console.log("نتيجة طلب إذن الإشعارات:", result);
      
      setState(prev => ({
        ...prev,
        granted
      }));
      
      if (granted) {
        toast.success('تم السماح بالإشعارات');
        return true;
      } else {
        toast.error('لم يتم السماح بالإشعارات');
        return false;
      }
    } catch (error) {
      console.error('خطأ في طلب إذن الإشعارات:', error);
      toast.error('حدث خطأ أثناء طلب إذن الإشعارات');
      return false;
    }
  };

  return {
    ...state,
    requestPermission
  };
}
