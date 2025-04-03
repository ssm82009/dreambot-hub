
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket } from '@/types/tickets';
import { formatDate } from '@/utils/formatDate';

type TicketListProps = {
  tickets: Ticket[];
};

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const navigate = useNavigate();

  const handleTicketClick = (id: string) => {
    navigate(`/tickets/${id}`);
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">رقم التذكرة</TableHead>
            <TableHead>العنوان</TableHead>
            <TableHead className="w-[120px]">الحالة</TableHead>
            <TableHead className="w-[150px]">تاريخ التحديث</TableHead>
            <TableHead className="w-[150px]">تاريخ الإنشاء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                لا توجد تذاكر حتى الآن
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
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
                <TableCell>{formatDate(ticket.updated_at)}</TableCell>
                <TableCell>{formatDate(ticket.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketList;
