
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ServiceWorkerState {
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

// متغير عام للتحكم في عرض رسائل التوست
const toastDisplayed = {
  updateAvailable: false
};

export function useServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    registration: null,
    error: null
  });
  
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('خدمة العامل غير مدعومة في هذا المتصفح');
      return;
    }
    
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        console.log('تم تسجيل خدمة العامل بنجاح:', registration);
        setState({
          isRegistered: true,
          registration,
          error: null
        });
        
        // تحديد خدمة العامل من خلال دالة واحدة لتجنب التكرار
        setupServiceWorkerUpdates(registration);
      } catch (error) {
        console.error('خطأ في تسجيل خدمة العامل:', error);
        setState({
          isRegistered: false,
          registration: null,
          error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
        });
      }
    };
    
    registerServiceWorker();
    
    // تنظيف عند إلغاء تحميل المكون
    return () => {
      // إعادة تعيين حالة رسائل التوست عند إلغاء التحميل
      toastDisplayed.updateAvailable = false;
    };
  }, []);
  
  // دالة منفصلة لإعداد مستمعي الأحداث للتحديثات
  const setupServiceWorkerUpdates = (registration: ServiceWorkerRegistration) => {
    // حذف أي مستمعي أحداث سابقة (لمنع التكرار)
    const newWorker = registration.installing;
    
    // إعداد مستمع حدث واحد للتحديثات
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // هناك خدمة عامل جديدة جاهزة للاستخدام
            
            // التحقق إذا تم عرض رسالة التوست بالفعل
            if (!toastDisplayed.updateAvailable) {
              toastDisplayed.updateAvailable = true;
              
              toast.success(
                'تم تحديث التطبيق',
                {
                  description: 'يرجى تحديث الصفحة لرؤية التغييرات الجديدة',
                  action: {
                    label: 'تحديث الصفحة',
                    onClick: () => {
                      window.location.reload();
                    }
                  },
                  // منع عرض التوست أكثر من مرة
                  id: 'sw-update-toast',
                  duration: 10000, // مدة عرض طويلة نسبيًا
                }
              );
            }
          }
        });
      }
    });
  };
  
  // دالة لإرسال رسالة إلى خدمة العامل
  const sendMessageToServiceWorker = (message: any) => {
    if (!state.registration || !navigator.serviceWorker.controller) {
      console.warn('لا يمكن إرسال رسالة: خدمة العامل غير مسجلة أو غير نشطة');
      return false;
    }
    
    navigator.serviceWorker.controller.postMessage(message);
    return true;
  };
  
  // دالة لتحديث خدمة العامل
  const updateServiceWorker = async () => {
    if (!state.registration) {
      console.warn('لا يمكن تحديث خدمة العامل: غير مسجلة');
      return false;
    }
    
    try {
      await state.registration.update();
      return true;
    } catch (error) {
      console.error('خطأ في تحديث خدمة العامل:', error);
      return false;
    }
  };
  
  return {
    ...state,
    sendMessageToServiceWorker,
    updateServiceWorker
  };
}
