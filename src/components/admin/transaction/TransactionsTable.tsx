
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
    if (!planName) return '';
    
    // تحويل اسم الخطة إلى حروف صغيرة للمقارنة
    const normalizedPlan = planName.toLowerCase();
    
    if (normalizedPlan.includes('premium') || normalizedPlan.includes('مميز')) {
      return 'المميزة';
    } else if (normalizedPlan.includes('pro') || normalizedPlan.includes('احترافي')) {
      return 'الاحترافية';
    } else if (normalizedPlan.includes('free') || normalizedPlan.includes('مجاني')) {
      return 'المجانية';
    }
    
    // إذا لم يتم العثور على تطابق، أعد النص الأصلي
    return planName;
  };
  
  const getPaymentMethodLabel = (method: string) => {
    if (!method) return '';
    
    const normalizedMethod = method.toLowerCase();
    
    if (normalizedMethod.includes('paylink')) {
      return 'باي لينك';
    } else if (normalizedMethod.includes('paypal')) {
      return 'باي بال';
    } else if (normalizedMethod.includes('manual')) {
      return 'يدوي';
    }
    
    return method;
  };

  // Normalize status to handle different status formats
  const normalizeStatus = (status: string) => {
    if (!status) return '';
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('paid') || normalizedStatus.includes('مدفوع')) {
      return 'مدفوع';
    } else if (normalizedStatus.includes('pending') || normalizedStatus.includes('قيد الانتظار')) {
      return 'قيد الانتظار';
    } else if (normalizedStatus.includes('failed') || normalizedStatus.includes('فشل')) {
      return 'فشل';
    } else if (normalizedStatus.includes('refunded') || normalizedStatus.includes('مسترجع')) {
      return 'مسترجع';
    }
    
    return status;
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
            const normalizedStatus = normalizeStatus(transaction.status);
            
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
