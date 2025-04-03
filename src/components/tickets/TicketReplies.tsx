
import React from 'react';
import { TicketReply } from '@/types/tickets';
import { formatDate } from '@/utils/formatDate';

type TicketRepliesProps = {
  replies: TicketReply[];
};

const TicketReplies: React.FC<TicketRepliesProps> = ({ replies }) => {
  if (replies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد ردود حتى الآن
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <div key={reply.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold">
              {reply.user?.full_name || 'مستخدم'}
            </p>
            <span className="text-sm text-muted-foreground">
              {formatDate(reply.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-wrap">{reply.content}</p>
        </div>
      ))}
    </div>
  );
};

export default TicketReplies;
