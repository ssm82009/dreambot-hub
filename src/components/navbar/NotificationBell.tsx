import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const navigate = useNavigate();
  const { supported, granted, subscription, subscribing, subscribeToNotifications, unsubscribeFromNotifications } = useNotifications();
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);
  const { isAdmin } = useAdminCheck();
  const [loading, setLoading] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchOpenTicketsCount = async () => {
      try {
        const { count, error } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open');

        if (error) throw error;
        
        setOpenTicketsCount(count || 0);
      } catch (error) {
        console.error('خطأ في جلب عدد التذاكر المفتوحة:', error);
      }
    };

    fetchOpenTicketsCount();

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

  const handleToggleNotifications = async () => {
    if (processingAction) return;

    console.log("تبديل حالة الإشعارات:", subscription ? "إلغاء الاشتراك" : "الاشتراك");
    try {
      setLoading(true);
      setProcessingAction(true);
      
      if (!navigator.onLine) {
        toast.error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
        return;
      }
      
      if (subscription) {
        await unsubscribeFromNotifications();
      } else {
        if (!supported) {
          toast.error('متصفحك لا يدعم الإشعارات');
          return;
        }
        
        if (Notification.permission === 'denied') {
          toast.error('تم رفض الإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح.');
          return;
        }
        
        await subscribeToNotifications();
      }
    } catch (err) {
      console.error("خطأ في تبديل حالة الإشعارات:", err);
      toast.error('حدث خطأ أثناء معالجة طلب الإشعارات');
    } finally {
      setLoading(false);
      setTimeout(() => setProcessingAction(false), 1000);
    }
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/tickets');
  };

  if (!supported) return null;

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
              disabled={subscribing || loading || processingAction}
            >
              {loading ? (
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
                {openTicketsCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{subscription ? 'إلغاء تفعيل الإشعارات' : 'تفعيل الإشعارات'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationBell;
