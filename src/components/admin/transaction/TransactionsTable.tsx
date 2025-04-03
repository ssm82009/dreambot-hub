
import React from 'react';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaymentStatusBadge from './PaymentStatusBadge';
import { normalizePaymentStatus, normalizePlanName, normalizePaymentMethod } from '@/utils/payment/statusNormalizer';

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
            const normalizedStatus = normalizePaymentStatus(transaction.status);
            const normalizedPlanName = normalizePlanName(transaction.plan_name);
            const normalizedPaymentMethod = normalizePaymentMethod(transaction.payment_method);
            
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {user.email || 'غير مسجل'}
                </TableCell>
                <TableCell>{transaction.invoice_id}</TableCell>
                <TableCell>{normalizedPlanName}</TableCell>
                <TableCell>{normalizedPaymentMethod}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>
                  {transaction.created_at && format(new Date(transaction.created_at), 'yyyy/MM/dd')}
                </TableCell>
                <TableCell>
                  {transaction.expires_at && format(new Date(transaction.expires_at), 'yyyy/MM/dd')}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={normalizedStatus} />
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
