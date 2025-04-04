
// Status constants
export const PAYMENT_STATUS = {
  PAID: 'مدفوع',
  PENDING: 'قيد الانتظار',
  FAILED: 'فشل',
  REFUNDED: 'مسترجع',
  CANCELLED: 'ملغي'
};

/**
 * Normalizes payment status to a consistent format
 */
export const normalizePaymentStatus = (status: string): string => {
  // Log the status that's being normalized for debugging
  console.log('Normalizing payment status:', status);
  
  if (!status) return PAYMENT_STATUS.PENDING;
  
  // Convert to lowercase for consistent comparison
  const normalizedStatus = status.toLowerCase();
  
  // Handle English status values
  if (normalizedStatus.includes('paid') || normalizedStatus.includes('success')) {
    return PAYMENT_STATUS.PAID;
  }
  
  if (normalizedStatus.includes('pending')) {
    return PAYMENT_STATUS.PENDING;
  }
  
  if (normalizedStatus.includes('failed') || normalizedStatus.includes('failure')) {
    return PAYMENT_STATUS.FAILED;
  }
  
  if (normalizedStatus.includes('refund')) {
    return PAYMENT_STATUS.REFUNDED;
  }
  
  if (normalizedStatus.includes('cancel')) {
    return PAYMENT_STATUS.CANCELLED;
  }
  
  // Handle Arabic status values
  if (normalizedStatus.includes('مدفوع') || normalizedStatus.includes('ناجح')) {
    return PAYMENT_STATUS.PAID;
  }
  
  if (normalizedStatus.includes('قيد') || normalizedStatus.includes('انتظار')) {
    return PAYMENT_STATUS.PENDING;
  }
  
  if (normalizedStatus.includes('فشل')) {
    return PAYMENT_STATUS.FAILED;
  }
  
  if (normalizedStatus.includes('مسترجع') || normalizedStatus.includes('استرجاع')) {
    return PAYMENT_STATUS.REFUNDED;
  }
  
  if (normalizedStatus.includes('ملغي') || normalizedStatus.includes('الغاء')) {
    return PAYMENT_STATUS.CANCELLED;
  }
  
  // If we can't determine the status, return the original value
  return status;
};

/**
 * Checks if a status is a pending payment status
 */
export const isPendingPaymentStatus = (status: string): boolean => {
  const normalizedStatus = normalizePaymentStatus(status);
  return normalizedStatus === PAYMENT_STATUS.PENDING;
};

/**
 * Gets a properly formatted status for database storage
 */
export const getDbPaymentStatus = (status: string): string => {
  return normalizePaymentStatus(status);
};

/**
 * Normalizes plan type to a consistent format (free, premium, pro)
 */
export const normalizePlanType = (planType: string): string => {
  if (!planType) return 'free';
  
  const normalizedType = planType.toLowerCase();
  
  if (normalizedType.includes('premium') || normalizedType.includes('مميز') || normalizedType.includes('متميز')) {
    return 'premium';
  }
  
  if (normalizedType.includes('pro') || normalizedType.includes('احترافي') || normalizedType.includes('محترف')) {
    return 'pro';
  }
  
  return 'free';
};

/**
 * Normalizes plan name for display
 */
export const normalizePlanName = (planName: string): string => {
  const planType = normalizePlanType(planName);
  
  if (planType === 'premium') {
    return 'الباقة المميزة';
  }
  
  if (planType === 'pro') {
    return 'الباقة الاحترافية';
  }
  
  return 'الباقة المجانية';
};

/**
 * Normalizes payment method to display text
 */
export const normalizePaymentMethod = (method: string): string => {
  if (!method) return 'غير معروف';
  
  const normalizedMethod = method.toLowerCase();
  
  if (normalizedMethod.includes('paypal')) {
    return 'باي بال';
  }
  
  if (normalizedMethod.includes('paylink')) {
    return 'باي لينك';
  }
  
  if (normalizedMethod.includes('manual')) {
    return 'يدوي';
  }
  
  return method;
};
