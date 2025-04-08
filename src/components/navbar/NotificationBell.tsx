
import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
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

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { supported, granted, subscription, subscribing, subscribeToNotifications, unsubscribeFromNotifications } = useNotifications();
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);
  const { isAdmin } = useAdminCheck();

  // جلب عدد التذاكر المفتوحة للمشرف
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
    console.log("تبديل حالة الإشعارات:", subscription ? "إلغاء الاشتراك" : "الاشتراك");
    try {
      if (subscription) {
        await unsubscribeFromNotifications();
      } else {
        await subscribeToNotifications();
      }
    } catch (err) {
      console.error("خطأ في تبديل حالة الإشعارات:", err);
    }
  };

  if (!supported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={handleToggleNotifications}
            disabled={subscribing}
          >
            {subscription ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            
            {isAdmin && openTicketsCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs" 
                variant="destructive"
              >
                {openTicketsCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{subscription ? 'إلغاء تفعيل الإشعارات' : 'تفعيل الإشعارات'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NotificationBell;
