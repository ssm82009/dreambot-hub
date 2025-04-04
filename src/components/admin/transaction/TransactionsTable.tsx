
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
            const displayPlanName = getPlanDisplayName(transaction.plan_name);
            const normalizedPaymentMethod = normalizePaymentMethod(transaction.payment_method);
            
            return (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {user.email || 'غير مسجل'}
                </TableCell>
                <TableCell>{transaction.invoice_id}</TableCell>
                <TableCell>{displayPlanName}</TableCell>
                <TableCell>{normalizedPaymentMethod}</TableCell>
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
