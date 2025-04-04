
/**
 * Normalizes a plan type string
 */
export const normalizePlanType = (planType: string): string => {
  const planTypeLower = planType?.toLowerCase() || '';
  
  if (planTypeLower.includes('premium') || planTypeLower.includes('مميز')) {
    return 'premium';
  } else if (planTypeLower.includes('pro') || planTypeLower.includes('احترافي')) {
    return 'pro';
  } else {
    return 'free';
  }
};

/**
 * Normalizes a plan name string
 */
export const normalizePlanName = (planName: string): string => {
  const planNameLower = planName?.toLowerCase() || '';
  
  if (planNameLower.includes('premium') || planNameLower.includes('مميز')) {
    return 'الباقة المميزة';
  } else if (planNameLower.includes('pro') || planNameLower.includes('احترافي')) {
    return 'الباقة الاحترافية';
  } else {
    return 'الباقة المجانية';
  }
};

/**
 * Normalizes a payment method string
 */
export const normalizePaymentMethod = (paymentMethod: string): string => {
  const paymentMethodLower = paymentMethod?.toLowerCase() || '';
  
  if (paymentMethodLower === 'paylink') {
    return 'باي لينك';
  } else if (paymentMethodLower === 'paypal') {
    return 'باي بال';
  } else if (paymentMethodLower === 'manual') {
    return 'يدوي';
  } else {
    return paymentMethod || 'غير محدد';
  }
};

/**
 * Payment status constants for consistency across the application
 */
export const PAYMENT_STATUS = {
  PAID: 'مدفوع',
  PENDING: 'قيد الانتظار',
  FAILED: 'فشل',
  REFUNDED: 'مسترجع',
  CANCELLED: 'ملغي'
};

/**
 * Normalizes a payment status string
 */
export const normalizePaymentStatus = (status: string): string => {
  if (!status) return PAYMENT_STATUS.PENDING;
  
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'مدفوع' || statusLower === 'paid' || statusLower === 'completed' || statusLower === 'success') {
    return PAYMENT_STATUS.PAID;
  } else if (statusLower === 'قيد الانتظار' || statusLower === 'pending' || statusLower === 'waiting') {
    return PAYMENT_STATUS.PENDING;
  } else if (statusLower === 'فشل' || statusLower === 'failed') {
    return PAYMENT_STATUS.FAILED;
  } else if (statusLower === 'مسترجع' || statusLower === 'refunded') {
    return PAYMENT_STATUS.REFUNDED;
  } else if (statusLower === 'ملغي' || statusLower === 'cancelled' || statusLower === 'canceled') {
    return PAYMENT_STATUS.CANCELLED;
  } else {
    return status || PAYMENT_STATUS.PENDING;
  }
};

/**
 * Get the database value for a payment status 
 * This ensures that we always store the status in the correct format in the database
 */
export const getDbPaymentStatus = (status: string): string => {
  return normalizePaymentStatus(status);
};

/**
 * Check if a payment status is considered successful (paid)
 */
export const isSuccessfulPaymentStatus = (status: string): boolean => {
  return normalizePaymentStatus(status) === PAYMENT_STATUS.PAID;
};

/**
 * Check if a payment status is pending
 */
export const isPendingPaymentStatus = (status: string): boolean => {
  return normalizePaymentStatus(status) === PAYMENT_STATUS.PENDING;
};

/**
 * Check if a payment status is failed
 */
export const isFailedPaymentStatus = (status: string): boolean => {
  const normalized = normalizePaymentStatus(status);
  return normalized === PAYMENT_STATUS.FAILED || 
         normalized === PAYMENT_STATUS.CANCELLED;
};
