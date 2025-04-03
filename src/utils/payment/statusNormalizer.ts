
/**
 * Utility to normalize payment status across different languages and formats
 */
export const normalizePaymentStatus = (status: string | null | undefined): string => {
  if (!status) return '';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  if (normalizedStatus.includes('paid') || normalizedStatus.includes('مدفوع')) {
    return 'مدفوع';
  } else if (normalizedStatus.includes('pending') || normalizedStatus.includes('قيد الانتظار')) {
    return 'قيد الانتظار';
  } else if (normalizedStatus.includes('failed') || normalizedStatus.includes('فشل')) {
    return 'فشل';
  } else if (normalizedStatus.includes('refunded') || normalizedStatus.includes('مسترجع')) {
    return 'مسترجع';
  }
  
  return status;
};
