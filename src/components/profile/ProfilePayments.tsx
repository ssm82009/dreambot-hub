import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { normalizePlanName, normalizePaymentMethod, PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';
import PaymentStatusBadge from '@/components/admin/transaction/PaymentStatusBadge';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  plan_name: string;
  payment_method: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface ProfilePaymentsProps {
  payments: Payment[];
}

// Define the expected return type from the RPC function
type RPCPaymentResponse = Payment[] | null;

const ProfilePayments: React.FC<ProfilePaymentsProps> = ({ payments }) => {
  const [refreshedPayments, setRefreshedPayments] = useState<Payment[]>([]);

  // Process payments to get the latest status for each invoice_id
  useEffect(() => {
    const processPayments = async () => {
      if (!payments || payments.length === 0) {
        setRefreshedPayments([]);
        return;
      }
      
      try {
        // Check if URL contains 'success' parameter to force status to "مدفوع"
        const isSuccessPage = window.location.href.includes('success');
        
        // Call the RPC function to get the latest payment invoices with proper typing
        const { data: latestInvoicesData, error: rpcError } = await supabase
          .rpc('get_latest_payment_invoices') as { data: RPCPaymentResponse, error: any };
        
        if (rpcError) {
          console.error("Error calling get_latest_payment_invoices:", rpcError);
          
          // Fallback: Group payments by invoice_id and get the most recent
          const invoiceGroups = payments.reduce((groups: Record<string, Payment[]>, payment) => {
            if (!groups[payment.invoice_id]) {
              groups[payment.invoice_id] = [];
            }
            groups[payment.invoice_id].push(payment);
            return groups;
          }, {});
          
          // For each invoice_id, get the most recent payment record
          const latestPayments = Object.values(invoiceGroups).map(group => {
            return group.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
          });
          
          // Filter to only include payments found in the original payments array
          const filteredLatestPayments = latestPayments.filter(payment => 
            payments.some(p => p.user_id === payment.user_id)
          );
          
          // Apply "مدفوع" status if on success page
          const processedPayments = isSuccessPage 
            ? filteredLatestPayments.map(payment => ({ ...payment, status: PAYMENT_STATUS.PAID }))
            : filteredLatestPayments;
            
          setRefreshedPayments(processedPayments);
          
          // Update payment status in the database if on success page
          if (isSuccessPage && filteredLatestPayments.length > 0) {
            await updatePaymentStatuses(filteredLatestPayments);
          }
        } else {
          // Successfully got data from RPC
          if (latestInvoicesData && latestInvoicesData.length > 0) {
            // Filter to only include payments for the current user
            const userPayments = latestInvoicesData.filter((invoice: Payment) => 
              payments.some(p => p.invoice_id === invoice.invoice_id || p.user_id === invoice.user_id)
            );
            
            // Apply "مدفوع" status if on success page
            const processedPayments = isSuccessPage 
              ? userPayments.map(payment => ({ ...payment, status: PAYMENT_STATUS.PAID }))
              : userPayments;
              
            console.log("ProfilePayments - Latest filtered payments:", processedPayments);
            setRefreshedPayments(processedPayments);
            
            // Update payment status in the database if on success page
            if (isSuccessPage && userPayments.length > 0) {
              await updatePaymentStatuses(userPayments);
            }
          } else {
            setRefreshedPayments([]);
          }
        }
      } catch (error) {
        console.error("Error processing payments:", error);
        setRefreshedPayments(payments);
      }
    };
    
    processPayments();
  }, [payments]);
  
  // Helper function to update payment statuses in the database
  const updatePaymentStatuses = async (paymentsList: Payment[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      
      for (const payment of paymentsList) {
        await supabase
          .from('payment_invoices')
          .update({ status: PAYMENT_STATUS.PAID })
          .eq('id', payment.id);
          
        console.log(`Updated payment status for ID ${payment.id} to مدفوع`);
        
        // Also update all records with the same invoice_id
        if (payment.invoice_id) {
          await supabase
            .from('payment_invoices')
            .update({ status: PAYMENT_STATUS.PAID })
            .eq('invoice_id', payment.invoice_id)
            .eq('user_id', session.user.id);
            
          console.log(`Updated all payment records with invoice_id ${payment.invoice_id} to مدفوع`);
        }
      }
    } catch (error) {
      console.error("Error updating payment statuses:", error);
    }
  };
  
  if (refreshedPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
          <CardDescription>لا توجد مدفوعات مسجلة حتى الآن</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">
              لم تقم بأي عمليات دفع حتى الآن. عند الاشتراك في إحدى الباقات المدفوعة، ستظهر تفاصيل المدفوعات هنا.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل المدفوعات</CardTitle>
        <CardDescription>
          قائمة بجميع عمليات الدفع والفواتير الخاصة بك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">الباقة</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">طريقة الدفع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refreshedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.created_at)}</TableCell>
                  <TableCell>{payment.invoice_id}</TableCell>
                  <TableCell>{normalizePlanName(payment.plan_name)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{normalizePaymentMethod(payment.payment_method)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePayments;
