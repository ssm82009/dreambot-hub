
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaymentStatusBadge from './PaymentStatusBadge';
import { normalizePaymentMethod, normalizePlanType } from '@/utils/payment/statusNormalizer';
import { supabase } from '@/integrations/supabase/client';

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
  const [planNames, setPlanNames] = useState<Record<string, string>>({
    free: 'المجانية',
    premium: 'المميزة',
    pro: 'الاحترافية'
  });

  useEffect(() => {
    // Fetch current plan names from pricing settings
    const fetchPlanNames = async () => {
      try {
        const { data, error } = await supabase
          .from('pricing_settings')
          .select('free_plan_name, premium_plan_name, pro_plan_name')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPlanNames({
            free: data.free_plan_name || 'المجانية',
            premium: data.premium_plan_name || 'المميزة',
            pro: data.pro_plan_name || 'الاحترافية'
          });
        }
      } catch (error) {
        console.error('Error fetching plan names:', error);
      }
    };
    
    fetchPlanNames();
  }, []);

  const getPlanDisplayName = (planName: string): string => {
    const normalizedType = normalizePlanType(planName);
    return planNames[normalizedType] || planName;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy/MM/dd');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return '-';
    }
  };

  return (
    <div className="w-full overflow-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="h-8 text-xs">
            <TableHead className="whitespace-nowrap px-1 py-1">البريد الإلكتروني</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">رقم الفاتورة</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">الباقة</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">طريقة الدفع</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">المبلغ</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">تاريخ الشراء</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">تاريخ الانتهاء</TableHead>
            <TableHead className="whitespace-nowrap px-1 py-1">الحالة</TableHead>
            <TableHead className="text-left whitespace-nowrap px-1 py-1">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const user = users[transaction.user_id] || {};
            const displayPlanName = getPlanDisplayName(transaction.plan_name);
            const normalizedPaymentMethod = normalizePaymentMethod(transaction.payment_method);
            
            return (
              <TableRow key={transaction.id} className="h-8 text-xs">
                <TableCell className="font-medium whitespace-nowrap px-1 py-1">
                  {user.email || 'غير مسجل'}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">{transaction.invoice_id}</TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">{displayPlanName}</TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">{normalizedPaymentMethod}</TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">{transaction.amount}</TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  {formatDate(transaction.created_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  {formatDate(transaction.expires_at)}
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  <PaymentStatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap px-1 py-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onEditClick(transaction)}
                    className="h-6 px-2 py-0 text-xs"
                  >
                    <Pencil className="h-3 w-3 ml-1" />
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
