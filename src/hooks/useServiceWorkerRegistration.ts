
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ServiceWorkerState {
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

// استخدام localStorage لتتبع ما إذا تم عرض رسالة التوست بالفعل
const getToastStateKey = (version) => `toast_displayed_version_${version}`;

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
  }, []);
  
  // دالة منفصلة لإعداد مستمعي الأحداث للتحديثات
  const setupServiceWorkerUpdates = (registration: ServiceWorkerRegistration) => {
    // إعداد مستمع حدث واحد للتحديثات
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // هناك خدمة عامل جديدة جاهزة للاستخدام
            
            // استخدام الإصدار الحالي للتطبيق كجزء من المفتاح - يمكن تعديله
            // لاستخدام أي قيمة تحدد الإصدار الحالي
            const version = new Date().toDateString();
            const toastKey = getToastStateKey(version);
            
            // تحقق مما إذا تم عرض التوست بالفعل لهذا الإصدار
            if (!localStorage.getItem(toastKey)) {
              // تسجيل أن التوست قد تم عرضه لهذا الإصدار
              localStorage.setItem(toastKey, 'true');
              
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
                  id: `sw-update-toast-${version}`,
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
