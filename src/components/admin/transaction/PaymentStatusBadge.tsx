
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
    variant = 'default'; // Success - green badge
  } else if (normalizedStatus === 'قيد الانتظار') {
    variant = 'secondary'; // Pending - gray badge
  } else if (normalizedStatus === 'فشل') {
    variant = 'destructive'; // Failed - red badge
  } else if (normalizedStatus === 'مسترجع') {
    variant = 'outline'; // Refunded - outlined badge
  } else if (normalizedStatus === 'ملغي') {
    variant = 'destructive'; // Cancelled - red badge
  }
  
  return <Badge variant={variant}>{normalizedStatus}</Badge>;
};

export default PaymentStatusBadge;
