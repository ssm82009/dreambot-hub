
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TicketList from '@/components/tickets/TicketList';
import { Ticket } from '@/types/tickets';

const TicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsUserLoggedIn(isLoggedIn);

      if (!isLoggedIn) {
        toast.error('يجب تسجيل الدخول لعرض التذاكر');
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchTickets = async () => {
      if (!checkAuth()) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Cast the data to ensure it matches our Ticket type
        setTickets(data?.map(ticket => ({
          ...ticket,
          status: ticket.status as 'open' | 'closed'
        })) || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('حدث خطأ أثناء جلب التذاكر');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  const handleCreateNewTicket = () => {
    navigate('/tickets/new');
  };

  if (!isUserLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4 rtl">
        <div className="container mx-auto">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl">نظام التذاكر والدعم الفني</CardTitle>
                <CardDescription>
                  يمكنك هنا إدارة طلبات الدعم الفني والشكاوى والاقتراحات
                </CardDescription>
              </div>
              <Button onClick={handleCreateNewTicket}>
                <PlusCircle className="ml-2 h-4 w-4" />
                تذكرة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TicketList tickets={tickets} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TicketsPage;
