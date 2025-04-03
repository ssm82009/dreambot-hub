
import React from 'react';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaymentStatusBadge from './PaymentStatusBadge';

interface TransactionsTableProps {
  transactions: any[];
  users: Record<string, any>;
  onEditClick: (transaction: any) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  transactions, 
  users, 
  onEditClick 
}) => {
  const getPlanLabel = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'premium': return 'مميز';
      case 'pro': return 'احترافي';
      case 'free': return 'مجاني';
      default: return planName;
    }
  };
  
  const getPaymentMethodLabel = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'paylink': return 'باي لينك';
      case 'paypal': return 'باي بال';
      case 'manual': return 'يدوي';
      default: return method;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>رقم الفاتورة</TableHead>
            <TableHead>الباقة</TableHead>
            <TableHead>طريقة الدفع</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>تاريخ الشراء</TableHead>
            <TableHead>تاريخ الانتهاء</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const user = users[transaction.user_id] || {};
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {user.email || 'غير مسجل'}
                </TableCell>
                <TableCell>{transaction.invoice_id}</TableCell>
                <TableCell>{getPlanLabel(transaction.plan_name)}</TableCell>
                <TableCell>{getPaymentMethodLabel(transaction.payment_method)}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>
                  {transaction.created_at && format(new Date(transaction.created_at), 'yyyy/MM/dd')}
                </TableCell>
                <TableCell>
                  {transaction.expires_at && format(new Date(transaction.expires_at), 'yyyy/MM/dd')}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={transaction.status} />
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onEditClick(transaction)}
                  >
                    <Pencil className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTable;
