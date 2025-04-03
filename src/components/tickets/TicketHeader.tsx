
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { TicketWithReplies } from '@/types/tickets';

type TicketHeaderProps = {
  ticket: TicketWithReplies;
  isAdmin: boolean;
  isSubmitting: boolean;
  onToggleStatus: () => Promise<void>;
};

const TicketHeader: React.FC<TicketHeaderProps> = ({
  ticket,
  isAdmin,
  isSubmitting,
  onToggleStatus,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => navigate('/tickets')}
        className="mb-4"
      >
        <ArrowLeft className="ml-2 h-4 w-4" />
        العودة إلى التذاكر
      </Button>
      
      <div className="flex flex-row items-start justify-between space-y-0">
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
            onClick={onToggleStatus}
            disabled={isSubmitting}
          >
            {ticket.status === 'open' ? 'إغلاق التذكرة' : 'إعادة فتح التذكرة'}
          </Button>
        )}
      </div>
    </>
  );
};

export default TicketHeader;
