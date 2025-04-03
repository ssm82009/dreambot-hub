
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

/**
 * Normalize plan name to standardized Arabic format
 */
export const normalizePlanName = (planName: string | null | undefined): string => {
  if (!planName) return '';
  
  const normalizedPlan = planName.toLowerCase().trim();
  
  if (normalizedPlan.includes('premium') || normalizedPlan.includes('مميز')) {
    return 'المميزة';
  } else if (normalizedPlan.includes('pro') || normalizedPlan.includes('احترافي')) {
    return 'الاحترافية';
  } else if (normalizedPlan.includes('free') || normalizedPlan.includes('مجاني')) {
    return 'المجانية';
  }
  
  return planName;
};

/**
 * Normalize payment method to standardized Arabic format
 */
export const normalizePaymentMethod = (method: string | null | undefined): string => {
  if (!method) return '';
  
  const normalizedMethod = method.toLowerCase().trim();
  
  if (normalizedMethod.includes('paylink')) {
    return 'باي لينك';
  } else if (normalizedMethod.includes('paypal')) {
    return 'باي بال';
  } else if (normalizedMethod.includes('manual')) {
    return 'يدوي';
  }
  
  return method;
};
