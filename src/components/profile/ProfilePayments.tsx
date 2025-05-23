
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

type RPCPaymentResponse = Payment[] | null;

const ProfilePayments: React.FC<ProfilePaymentsProps> = ({ payments }) => {
  const [refreshedPayments, setRefreshedPayments] = useState<Payment[]>([]);
  const [paymentUpdated, setPaymentUpdated] = useState(false);

  useEffect(() => {
    const processPayments = async () => {
      if (!payments || payments.length === 0) {
        setRefreshedPayments([]);
        return;
      }
      
      try {
        const isSuccessPage = window.location.href.includes('success');
        console.log("Is success page:", isSuccessPage);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          setRefreshedPayments(payments);
          return;
        }
        
        const { data: latestInvoicesData, error: rpcError } = await supabase
          .rpc('get_latest_payment_invoices') as { data: RPCPaymentResponse, error: any };
        
        if (rpcError) {
          console.error("Error calling get_latest_payment_invoices:", rpcError);
          
          const invoiceGroups = payments.reduce((groups: Record<string, Payment[]>, payment) => {
            if (!groups[payment.invoice_id]) {
              groups[payment.invoice_id] = [];
            }
            groups[payment.invoice_id].push(payment);
            return groups;
          }, {});
          
          const latestPayments = Object.values(invoiceGroups).map(group => {
            return group.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
          });
          
          const filteredLatestPayments = latestPayments.filter(payment => 
            payments.some(p => p.user_id === payment.user_id)
          );
          
          const shouldUpdateStatus = isSuccessPage && 
            filteredLatestPayments.some(p => p.status === PAYMENT_STATUS.PENDING || p.status === 'pending' || p.status === 'Pending');
            
          if (shouldUpdateStatus) {
            console.log("Attempting to update payment statuses as user");
            await updatePaymentStatuses(filteredLatestPayments, session.user.id);
          }
            
          const processedPayments = shouldUpdateStatus
            ? filteredLatestPayments.map(payment => ({ 
                ...payment, 
                status: payment.status === PAYMENT_STATUS.PENDING ? PAYMENT_STATUS.PAID : payment.status 
              }))
            : filteredLatestPayments;
            
          setRefreshedPayments(processedPayments);
        } else {
          console.log("RPC function returned data:", latestInvoicesData);
          if (latestInvoicesData && latestInvoicesData.length > 0) {
            const userPayments = latestInvoicesData.filter((invoice: Payment) => 
              payments.some(p => p.invoice_id === invoice.invoice_id || p.user_id === invoice.user_id)
            );
            
            const shouldUpdateStatus = isSuccessPage && 
              userPayments.some(p => p.status === PAYMENT_STATUS.PENDING || p.status === 'pending' || p.status === 'Pending');
            
            if (shouldUpdateStatus) {
              console.log("Attempting to update payment statuses as user from RPC function");
              await updatePaymentStatuses(userPayments, session.user.id);
            }
              
            const processedPayments = shouldUpdateStatus
              ? userPayments.map(payment => ({ 
                  ...payment, 
                  status: payment.status === PAYMENT_STATUS.PENDING ? PAYMENT_STATUS.PAID : payment.status 
                }))
              : userPayments;
              
            console.log("ProfilePayments - Latest filtered payments:", processedPayments);
            setRefreshedPayments(processedPayments);
          } else {
            console.log("No payments returned from RPC function");
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
  
  const updatePaymentStatuses = async (paymentsList: Payment[], userId: string) => {
    try {
      let anyUpdateSucceeded = false;
      
      for (const payment of paymentsList) {
        if (payment.status === PAYMENT_STATUS.PENDING || payment.status === 'pending' || payment.status === 'Pending') {
          try {
            const { error: paymentUpdateError } = await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('id', payment.id)
              .eq('user_id', userId);
              
            if (!paymentUpdateError) {
              console.log(`Updated payment status for ID ${payment.id} to مدفوع`);
              anyUpdateSucceeded = true;
            } else {
              console.error(`Error updating payment status for ID ${payment.id}:`, paymentUpdateError);
            }
          } catch (error) {
            console.error(`Exception updating payment for ID ${payment.id}:`, error);
          }
        }
        
        if (payment.invoice_id && (payment.status === PAYMENT_STATUS.PENDING || payment.status === 'pending' || payment.status === 'Pending')) {
          try {
            const { error: invoiceUpdateError } = await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('invoice_id', payment.invoice_id)
              .eq('user_id', userId)
              .eq('status', PAYMENT_STATUS.PENDING);
              
            if (!invoiceUpdateError) {
              console.log(`Updated all payment records with invoice_id ${payment.invoice_id} to مدفوع`);
              anyUpdateSucceeded = true;
            } else {
              console.error(`Error updating by invoice_id ${payment.invoice_id}:`, invoiceUpdateError);
            }
          } catch (error) {
            console.error(`Exception updating by invoice_id ${payment.invoice_id}:`, error);
          }
        }
      }
      
      if (anyUpdateSucceeded) {
        setPaymentUpdated(true);
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
                    <PaymentStatusBadge status={
                      (paymentUpdated && payment.status === PAYMENT_STATUS.PENDING) 
                        ? PAYMENT_STATUS.PAID 
                        : payment.status
                    } />
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
