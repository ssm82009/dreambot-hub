
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  // Automatically refresh payment data when component mounts
  useEffect(() => {
    setRefreshedPayments(payments);
    
    // Log the payment data for debugging
    console.log("ProfilePayments - Received payments:", payments);
  }, [payments]);

  const getStatusBadge = (status: string) => {
    // تحسين عرض حالة الدفع مع مراعاة حالات الأحرف واللغة
    const normalizedStatus = status?.toLowerCase()?.trim();
    
    switch (normalizedStatus) {
      case 'paid':
      case 'مدفوع':
        return <Badge variant="default">مدفوع</Badge>;
      case 'pending':
      case 'قيد الانتظار':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'failed':
      case 'فشل':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPlanTranslation = (planName: string) => {
    if (!planName) return 'غير محدد';
    
    switch (planName.toLowerCase()) {
      case 'premium':
      case 'المميز':
      case 'مميز':
        return 'الباقة المميزة';
      case 'pro':
      case 'الاحترافي':
      case 'احترافي':
        return 'الباقة الاحترافية';
      case 'free':
      case 'مجاني':
        return 'الباقة المجانية';
      default:
        return planName;
    }
  };
  
  const getPaymentMethodTranslation = (method: string) => {
    if (!method) return 'غير محدد';
    
    switch (method.toLowerCase()) {
      case 'paylink':
      case 'باي لينك':
        return 'باي لينك';
      case 'paypal':
      case 'باي بال':
        return 'باي بال';
      default:
        return method;
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
                  <TableCell>{getPlanTranslation(payment.plan_name)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getPaymentMethodTranslation(payment.payment_method)}</TableCell>
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
