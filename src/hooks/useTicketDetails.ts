
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketWithReplies, TicketReply } from '@/types/tickets';

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
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, email, full_name, role')
              .eq('id', reply.user_id)
              .single();
            
            if (userError) {
              console.error('Error fetching user data:', userError);
              return { ...reply, user: null };
            }
            
            return { ...reply, user: userData };
          })
        );
        
        // دمج البيانات مع التأكد من تطابق الأنواع
        setTicket({
          ...ticketData,
          status: ticketData.status as 'open' | 'closed',
          replies: repliesWithUserData || []
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

      // Fetch user data for the new reply
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // تحديث حالة الردود محلياً
      const newReplyWithUser: TicketReply = {
        ...replyData,
        user: userData || undefined
      };
      
      setTicket(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          replies: [...prev.replies, newReplyWithUser]
        };
      });
      
      toast.success('تم إضافة الرد بنجاح');
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
