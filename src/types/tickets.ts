
import { User } from './database';

export type Ticket = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
};

export type TicketReply = {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    role: string;
  } | null;
};

export type TicketWithReplies = Ticket & {
  replies: TicketReply[];
  user?: User;
};
