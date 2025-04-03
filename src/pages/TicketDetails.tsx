
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTicketDetails } from '@/hooks/useTicketDetails';
import TicketHeader from '@/components/tickets/TicketHeader';
import TicketContent from '@/components/tickets/TicketContent';
import TicketReplyForm from '@/components/tickets/TicketReplyForm';

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    ticket,
    isLoading,
    isAdmin,
    isSubmitting,
    handleAddReply,
    handleToggleStatus
  } = useTicketDetails(id);

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
