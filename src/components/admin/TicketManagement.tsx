
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Ticket } from '@/types/tickets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { sendNotification } from '@/services/notificationService';

const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Cast the data to the expected type explicitly
          setTickets(data?.map(ticket => ({
            ...ticket,
            status: ticket.status as 'open' | 'closed'
          })) || []);
        } else {
          setTickets([]);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('حدث خطأ في جلب بيانات التذاكر');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = searchTerm
    ? tickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tickets;

  const handleToggleStatus = async (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newStatus = ticket.status === 'open' ? 'closed' : 'open';
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', ticket.id as any);

      if (error) throw error;

      setTickets(prev => 
        prev.map(t => t.id === ticket.id ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t)
      );

      toast.success(`تم ${newStatus === 'closed' ? 'إغلاق' : 'إعادة فتح'} التذكرة بنجاح`);
      
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
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة التذكرة');
    }
  };

  const handleTicketClick = (id: string) => {
    navigate(`/tickets/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input 
          placeholder="بحث عن تذكرة..." 
          className="w-full max-w-sm" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">رقم التذكرة</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead className="w-[100px]">الحالة</TableHead>
                <TableHead className="w-[150px]">تاريخ الإنشاء</TableHead>
                <TableHead className="w-[150px]">آخر تحديث</TableHead>
                <TableHead className="w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد تذاكر متاحة
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTicketClick(ticket.id)}
                  >
                    <TableCell className="font-medium">{ticket.id.substring(0, 8)}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ticket.status === 'open' ? 'default' : 'secondary'}
                      >
                        {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                    <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={ticket.status === 'open' ? 'destructive' : 'default'}
                        onClick={(e) => handleToggleStatus(ticket, e)}
                      >
                        {ticket.status === 'open' ? 'إغلاق' : 'فتح'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
