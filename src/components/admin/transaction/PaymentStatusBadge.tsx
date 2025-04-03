
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { normalizePaymentStatus } from '@/utils/payment/statusNormalizer';

type PaymentStatusBadgeProps = {
  status: string;
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  // Use the normalizer utility to standardize status
  const normalizedStatus = normalizePaymentStatus(status);
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  
  // Map the normalized status to a badge variant
  if (normalizedStatus === 'مدفوع') {
    variant = 'default';
  } else if (normalizedStatus === 'قيد الانتظار') {
    variant = 'secondary';
  } else if (normalizedStatus === 'فشل') {
    variant = 'destructive';
  } else if (normalizedStatus === 'مسترجع') {
    variant = 'outline';
  }
  
  return <Badge variant={variant}>{normalizedStatus}</Badge>;
};

export default PaymentStatusBadge;
