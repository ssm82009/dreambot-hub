
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { normalizePaymentStatus, normalizePlanName, normalizePaymentMethod } from '@/utils/payment/statusNormalizer';

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

const ProfilePayments: React.FC<ProfilePaymentsProps> = ({ payments }) => {
  const [refreshedPayments, setRefreshedPayments] = useState<Payment[]>(payments);

  // Automatically refresh payment data when component mounts or payments prop changes
  useEffect(() => {
    setRefreshedPayments(payments);
    
    // Log the payment data for debugging
    console.log("ProfilePayments - Received payments:", payments);
  }, [payments]);

  const getStatusBadge = (status: string) => {
    // Use our utility function for normalization
    const normalizedStatus = normalizePaymentStatus(status);
    
    switch (normalizedStatus) {
      case 'مدفوع':
        return <Badge variant="default">مدفوع</Badge>;
      case 'قيد الانتظار':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'فشل':
        return <Badge variant="destructive">فشل</Badge>;
      case 'مسترجع':
        return <Badge variant="outline">مسترجع</Badge>;
      case 'ملغي':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">{normalizedStatus}</Badge>;
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
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
