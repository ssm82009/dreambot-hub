
import React from 'react';
import { Badge } from '@/components/ui/badge';

type PaymentStatusBadgeProps = {
  status: string;
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  // تحسين عرض حالة الدفع مع مراعاة حالات الأحرف واللغة
  const normalizedStatus = status?.toLowerCase()?.trim() || '';
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let label = status || '';
  
  // التحقق من القيم المحتملة للحالة
  if (normalizedStatus.includes('paid') || normalizedStatus.includes('مدفوع')) {
    variant = 'default';
    label = 'مدفوع';
  } else if (normalizedStatus.includes('pending') || normalizedStatus.includes('قيد الانتظار')) {
    variant = 'secondary';
    label = 'قيد الانتظار';
  } else if (normalizedStatus.includes('failed') || normalizedStatus.includes('فشل')) {
    variant = 'destructive';
    label = 'فشل';
  } else if (normalizedStatus.includes('refunded') || normalizedStatus.includes('مسترجع')) {
    variant = 'outline';
    label = 'مسترجع';
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

export default PaymentStatusBadge;
