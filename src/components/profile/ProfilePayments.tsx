
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/lib/utils';

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
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default">مدفوع</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPlanTranslation = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium':
        return 'الباقة المميزة';
      case 'pro':
        return 'الباقة الاحترافية';
      case 'free':
        return 'الباقة المجانية';
      default:
        return planName;
    }
  };
  
  const getPaymentMethodTranslation = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paylink':
        return 'باي لينك';
      case 'paypal':
        return 'باي بال';
      default:
        return method;
    }
  };
  
  if (payments.length === 0) {
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
          <table className="w-full text-right">
            <thead className="border-b">
              <tr>
                <th className="pb-3 pt-2 font-medium">التاريخ</th>
                <th className="pb-3 pt-2 font-medium">رقم الفاتورة</th>
                <th className="pb-3 pt-2 font-medium">الباقة</th>
                <th className="pb-3 pt-2 font-medium">المبلغ</th>
                <th className="pb-3 pt-2 font-medium">طريقة الدفع</th>
                <th className="pb-3 pt-2 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="py-3">{formatDate(payment.created_at)}</td>
                  <td className="py-3">{payment.invoice_id}</td>
                  <td className="py-3">{getPlanTranslation(payment.plan_name)}</td>
                  <td className="py-3">{formatCurrency(payment.amount)}</td>
                  <td className="py-3">{getPaymentMethodTranslation(payment.payment_method)}</td>
                  <td className="py-3">{getStatusBadge(payment.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePayments;
