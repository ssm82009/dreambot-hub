
import React from 'react';
import { TicketWithReplies } from '@/types/tickets';
import TicketReplies from './TicketReplies';

type TicketContentProps = {
  ticket: TicketWithReplies;
};

const TicketContent: React.FC<TicketContentProps> = ({ ticket }) => {
  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md bg-muted/50">
        <p className="whitespace-pre-wrap">{ticket.description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">الردود</h3>
        <TicketReplies replies={ticket.replies} />
      </div>
    </div>
  );
};

export default TicketContent;
