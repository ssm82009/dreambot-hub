
import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar, { NAVBAR_HEIGHT } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTicketDetails } from '@/hooks/useTicketDetails';
import TicketHeader from '@/components/tickets/TicketHeader';
import TicketContent from '@/components/tickets/TicketContent';
import TicketReplyForm from '@/components/tickets/TicketReplyForm';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    ticket,
    isLoading,
    isAdmin,
    isSubmitting,
    handleAddReply,
    handleToggleStatus
  } = useTicketDetails(id);

  // إعادة تعيين موضع التمرير للأعلى عند تغيير المسار
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
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
        <main className="flex-1 px-4 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <div className="container mx-auto text-center py-6">
            <p className="text-xl text-muted-foreground mb-4">التذكرة غير موجودة</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 rtl" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <div className="container mx-auto max-w-4xl py-6">
          <Card className="mb-6">
            <CardHeader>
              <TicketHeader
                ticket={ticket}
                isAdmin={isAdmin}
                isSubmitting={isSubmitting}
                onToggleStatus={handleToggleStatus}
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <TicketContent ticket={ticket} />
              
              <TicketReplyForm
                isClosed={ticket.status === 'closed'}
                isSubmitting={isSubmitting}
                onAddReply={handleAddReply}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TicketDetails;
