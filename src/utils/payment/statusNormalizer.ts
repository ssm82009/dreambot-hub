
/**
 * Utility to normalize payment status across different languages and formats
 */
export const normalizePaymentStatus = (status: string | null | undefined): string => {
  if (!status) return '';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  // Map all possible payment status variations to standardized Arabic values
  if (
    normalizedStatus.includes('paid') || 
    normalizedStatus.includes('مدفوع') ||
    normalizedStatus.includes('approved') ||
    normalizedStatus.includes('completed') ||
    normalizedStatus.includes('successful') ||
    normalizedStatus.includes('success')
  ) {
    return 'مدفوع';
  } else if (
    normalizedStatus.includes('pending') || 
    normalizedStatus.includes('قيد الانتظار') ||
    normalizedStatus.includes('processing') ||
    normalizedStatus.includes('in process') ||
    normalizedStatus.includes('waiting')
  ) {
    return 'قيد الانتظار';
  } else if (
    normalizedStatus.includes('failed') || 
    normalizedStatus.includes('فشل') ||
    normalizedStatus.includes('declined') ||
    normalizedStatus.includes('rejected') ||
    normalizedStatus.includes('error')
  ) {
    return 'فشل';
  } else if (
    normalizedStatus.includes('refunded') || 
    normalizedStatus.includes('مسترجع') ||
    normalizedStatus.includes('returned') ||
    normalizedStatus.includes('chargeback')
  ) {
    return 'مسترجع';
  }
  
  // If no match found, return the original status
  return status;
};

/**
 * Normalize plan name to standardized Arabic format
 */
export const normalizePlanName = (planName: string | null | undefined): string => {
  if (!planName) return '';
  
  const normalizedPlan = planName.toLowerCase().trim();
  
  if (normalizedPlan === 'premium' || normalizedPlan.includes('مميز')) {
    return 'المميزة';
  } else if (normalizedPlan === 'pro' || normalizedPlan.includes('احترافي')) {
    return 'الاحترافية';
  } else if (normalizedPlan === 'free' || normalizedPlan.includes('مجاني')) {
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
