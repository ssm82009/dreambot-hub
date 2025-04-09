
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const navigate = useNavigate();
  const { 
    supported, 
    granted, 
    subscription, 
    subscribing, 
    isCheckingSubscription,
    requestPermission,
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = useNotifications();
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);
  const { isAdmin } = useAdminCheck();
  const [loading, setLoading] = useState<boolean>(false);
  const [processingRequest, setProcessingRequest] = useState<boolean>(false);

  // جلب عدد التذاكر المفتوحة للمشرف
  useEffect(() => {
    if (!isAdmin) return;

    const fetchOpenTicketsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open');

        if (error) {
          console.error('خطأ في جلب عدد التذاكر المفتوحة:', error);
          return;
        }
        
        setOpenTicketsCount(count || 0);
      } catch (error) {
        console.error('خطأ في جلب عدد التذاكر المفتوحة:', error);
      }
    };

    fetchOpenTicketsCount();

    // الاستماع للتغييرات في التذاكر في الوقت الفعلي
    const channel = supabase
      .channel('ticket-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tickets' 
        }, 
        () => {
          fetchOpenTicketsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // معالج النقر على زر الإشعارات
  const handleToggleNotifications = async () => {
    // تجنب معالجة طلبات متعددة في نفس الوقت
    if (processingRequest || loading || subscribing || isCheckingSubscription) {
      return;
    }
    
    try {
      setProcessingRequest(true);
      setLoading(true);
      
      if (subscription) {
        console.log("بدء عملية إلغاء الاشتراك من الإشعارات");
        await unsubscribeFromNotifications();
        toast.success('تم إلغاء تفعيل الإشعارات');
      } else {
        console.log("بدء عملية الاشتراك في الإشعارات");
        
        // تحقق من الإذن أولاً إذا لم يكن ممنوحًا
        if (!granted) {
          console.log("طلب إذن الإشعارات...");
          const permissionGranted = await requestPermission();
          
          if (!permissionGranted) {
            console.log("تم رفض إذن الإشعارات");
            toast.error('يجب السماح بالإشعارات لتفعيل هذه الخدمة');
            return;
          }
        }
        
        // إذا تم منح الإذن، قم بالاشتراك
        const result = await subscribeToNotifications();
        if (result) {
          toast.success('تم تفعيل الإشعارات بنجاح');
        }
      }
    } catch (err) {
      console.error("خطأ في تبديل حالة الإشعارات:", err);
      toast.error('حدث خطأ أثناء تغيير إعدادات الإشعارات');
    } finally {
      setLoading(false);
      // تأخير إعادة تعيين معالجة الطلبات للسماح بتحديث واجهة المستخدم
      setTimeout(() => {
        setProcessingRequest(false);
      }, 1000);
    }
  };

  // معالج النقر على شارة العدد للانتقال إلى صفحة التذاكر
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // منع انتشار الحدث إلى زر الجرس
    navigate('/tickets');
  };

  if (!supported) return null;

  // تحديد نص التلميح
  const getTooltipText = () => {
    if (loading || subscribing || isCheckingSubscription) {
      return 'جاري المعالجة...';
    }
    return subscription ? 'إلغاء تفعيل الإشعارات' : 'تفعيل الإشعارات';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className={className}
              onClick={handleToggleNotifications}
              disabled={loading || subscribing || isCheckingSubscription || processingRequest}
              aria-label={subscription ? 'إلغاء تفعيل الإشعارات' : 'تفعيل الإشعارات'}
            >
              {loading || subscribing || isCheckingSubscription ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : subscription ? (
                <Bell className="h-5 w-5" />
              ) : (
                <BellOff className="h-5 w-5" />
              )}
            </Button>
            
            {isAdmin && openTicketsCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs cursor-pointer" 
                variant="destructive"
                onClick={handleBadgeClick}
              >
                {openTicketsCount > 99 ? '99+' : openTicketsCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationBell;
