
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
  if (normalizedStatus === 'مدفوع' || normalizedStatus.includes('paid')) {
    variant = 'default'; // Success
  } else if (normalizedStatus === 'قيد الانتظار' || normalizedStatus.includes('pending')) {
    variant = 'secondary'; // Pending
  } else if (normalizedStatus === 'فشل' || normalizedStatus.includes('failed')) {
    variant = 'destructive'; // Failed
  } else if (normalizedStatus === 'مسترجع' || normalizedStatus.includes('refunded')) {
    variant = 'outline'; // Refunded
  }
  
  return <Badge variant={variant}>{normalizedStatus}</Badge>;
};

export default PaymentStatusBadge;
