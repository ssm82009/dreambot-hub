
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketWithReplies, TicketReply } from '@/types/tickets';
import { User } from '@/types/database';
import { sendNotification, sendNotificationToAdmin } from '@/services/notificationService';

export function useTicketDetails(id: string | undefined) {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketWithReplies | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get the current user ID
    const getUserId = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user?.id;
        if (userId) {
          setUserId(userId);
        } else {
          // Fallback - Use stored user ID if auth doesn't work
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            setUserId(storedUserId);
          } else {
            toast.error('يجب تسجيل الدخول لعرض التذاكر');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error getting user session:', error);
      }
    };

    // التحقق من صلاحيات المشرف
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem('isAdminLoggedIn') === 'true';
      setIsAdmin(adminStatus);
    };

    // جلب بيانات التذكرة وردودها
    const fetchTicketDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        
        // جلب التذكرة
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', id)
          .single();

        if (ticketError) throw ticketError;
        
        // جلب بيانات المستخدم صاحب التذكرة
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name, role, subscription_type, subscription_expires_at')
          .eq('id', ticketData.user_id)
          .single();
          
        if (userError) {
          console.error('Error fetching ticket user data:', userError);
        }
        
        // جلب الردود
        const { data: repliesData, error: repliesError } = await supabase
          .from('ticket_replies')
          .select('*')
          .eq('ticket_id', id)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        
        // Fetch user data separately for each reply
        const repliesWithUserData = await Promise.all(
          (repliesData || []).map(async (reply) => {
            // Fetch user data for this reply
            const { data: replyUserData, error: replyUserError } = await supabase
              .from('users')
              .select('id, email, full_name, role, subscription_type, subscription_expires_at')
              .eq('id', reply.user_id)
              .single();
            
            if (replyUserError) {
              console.error('Error fetching reply user data:', replyUserError);
              return { ...reply, user: null };
            }
            
            return { ...reply, user: replyUserData as User | null };
          })
        );
        
        // دمج البيانات مع التأكد من تطابق الأنواع
        setTicket({
          ...ticketData,
          status: ticketData.status as 'open' | 'closed',
          replies: repliesWithUserData || [],
          user: userData as User | undefined
        });
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        toast.error('حدث خطأ أثناء جلب بيانات التذكرة');
        navigate('/tickets');
      } finally {
        setIsLoading(false);
      }
    };

    getUserId();
    checkAdminStatus();
    fetchTicketDetails();
  }, [id, navigate]);

  // إضافة رد جديد
  const handleAddReply = async (newReply: string) => {
    if (!newReply.trim() || !ticket || !userId) {
      toast.error('يرجى كتابة رد قبل الإرسال');
      return;
    }

    try {
      setIsSubmitting(true);

      // Add reply to the database
      const { data: replyData, error } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: ticket.id,
          content: newReply.trim(),
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket updated_at timestamp
      await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticket.id);

      // Fetch user data for the new reply
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role, subscription_type, subscription_expires_at')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // تحديث حالة الردود محلياً
      const newReplyWithUser: TicketReply = {
        ...replyData,
        user: userData as User | null || undefined
      };
      
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          updated_at: new Date().toISOString(),
          replies: [...prev.replies, newReplyWithUser]
        };
      });
      
      toast.success('تم إضافة الرد بنجاح');

      // إرسال إشعار حسب دور المستخدم
      try {
        if (isAdmin && ticket.user_id) {
          // إذا كان المستجيب هو المشرف، أرسل إشعارًا للمستخدم صاحب التذكرة
          await sendNotification(ticket.user_id, {
            title: 'رد جديد على تذكرتك',
            body: `تم إضافة رد جديد على التذكرة: ${ticket.title}`,
            url: `/tickets/${ticket.id}`,
            type: 'ticket'
          });
        } else {
          // إذا كان المستجيب هو المستخدم، أرسل إشعارًا للمشرفين
          await sendNotificationToAdmin({
            title: 'رد جديد على تذكرة',
            body: `تم إضافة رد جديد على التذكرة: ${ticket.title}`,
            url: `/tickets/${ticket.id}`,
            type: 'ticket'
          });
        }
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
      }

      return true;
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('حدث خطأ أثناء إضافة الرد');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // تغيير حالة التذكرة (فتح/إغلاق)
  const handleToggleStatus = async () => {
    if (!ticket) return;

    const newStatus = ticket.status === 'open' ? 'closed' : 'open';
    
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      // تحديث حالة التذكرة محلياً
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: newStatus as 'open' | 'closed',
          updated_at: new Date().toISOString()
        };
      });

      toast.success(`تم ${newStatus === 'closed' ? 'إغلاق' : 'إعادة فتح'} التذكرة بنجاح`);

      // إرسال إشعار للمستخدم إذا تم تغيير الحالة بواسطة المشرف
      if (isAdmin && ticket.user_id) {
        try {
          await sendNotification(ticket.user_id, {
            title: `تم ${newStatus === 'closed' ? 'إغلاق' : 'إعادة فتح'} التذكرة`,
            body: `تم ${newStatus === 'closed' ? 'إغلاق' : 'إعادة فتح'} التذكرة: ${ticket.title}`,
            url: `/tickets/${ticket.id}`,
            type: 'ticket'
          });
        } catch (notifyError) {
          console.error('Error sending notification:', notifyError);
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة التذكرة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ticket,
    isLoading,
    isAdmin,
    isSubmitting,
    handleAddReply,
    handleToggleStatus
  };
}
