
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketWithReplies, TicketReply } from '@/types/tickets';
import TicketReplies from '@/components/tickets/TicketReplies';
import { formatDate } from '@/utils/formatDate';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketWithReplies | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
  const handleAddReply = async () => {
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
      
      // مسح حقل الرد
      setNewReply('');
      toast.success('تم إضافة الرد بنجاح');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('حدث خطأ أثناء إضافة الرد');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-20 px-4 rtl">
          <div className="container mx-auto text-center">
            <p className="text-xl text-muted-foreground mb-4">التذكرة غير موجودة</p>
            <Button onClick={() => navigate('/tickets')}>
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى التذاكر
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 rtl">
        <div className="container mx-auto max-w-4xl">
          <Button 
            variant="outline" 
            onClick={() => navigate('/tickets')}
            className="mb-4"
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى التذاكر
          </Button>
          
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                  <Badge
                    variant={ticket.status === 'open' ? 'default' : 'secondary'}
                  >
                    {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </Badge>
                </div>
                <CardDescription>
                  <span>رقم التذكرة: {ticket.id}</span>
                  <span className="mx-2">•</span>
                  <span>أنشئت في: {formatDate(ticket.created_at)}</span>
                  <span className="mx-2">•</span>
                  <span>آخر تحديث: {formatDate(ticket.updated_at)}</span>
                </CardDescription>
              </div>
              
              {isAdmin && (
                <Button
                  variant={ticket.status === 'open' ? 'destructive' : 'default'}
                  onClick={handleToggleStatus}
                  disabled={isSubmitting}
                >
                  {ticket.status === 'open' ? 'إغلاق التذكرة' : 'إعادة فتح التذكرة'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border p-4 rounded-md bg-muted/50">
                <p className="whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">الردود</h3>
                <TicketReplies replies={ticket.replies} />
              </div>

              {ticket.status === 'open' && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">إضافة رد</h3>
                  <Textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAddReply}
                      disabled={isSubmitting || !newReply.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        'إرسال الرد'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status === 'closed' && (
                <div className="text-center py-4 text-muted-foreground border-t">
                  تم إغلاق هذه التذكرة ولا يمكن إضافة ردود جديدة
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TicketDetails;
