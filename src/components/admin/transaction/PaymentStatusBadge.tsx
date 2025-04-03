
import React from 'react';
import { Badge } from '@/components/ui/badge';

type PaymentStatusBadgeProps = {
  status: string;
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  // تحسين عرض حالة الدفع مع مراعاة حالات الأحرف واللغة
  const normalizedStatus = status?.toLowerCase()?.trim();
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let label = status;
  
  switch (normalizedStatus) {
    case 'paid':
    case 'مدفوع':
      variant = 'default';
      label = 'مدفوع';
      break;
    case 'pending':
    case 'قيد الانتظار':
      variant = 'secondary';
      label = 'قيد الانتظار';
      break;
    case 'failed':
    case 'فشل':
      variant = 'destructive';
      label = 'فشل';
      break;
    case 'refunded':
    case 'مسترجع':
      variant = 'outline';
      label = 'مسترجع';
      break;
    default:
      break;
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

export default PaymentStatusBadge;
