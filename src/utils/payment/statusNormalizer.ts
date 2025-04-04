
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
 * Normalizes a payment status string
 */
export const normalizePaymentStatus = (status: string): string => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'مدفوع' || statusLower === 'paid' || statusLower === 'completed' || statusLower === 'success') {
    return 'مدفوع';
  } else if (statusLower === 'قيد الانتظار' || statusLower === 'pending' || statusLower === 'waiting') {
    return 'قيد الانتظار';
  } else if (statusLower === 'فشل' || statusLower === 'failed') {
    return 'فشل';
  } else if (statusLower === 'مسترجع' || statusLower === 'refunded') {
    return 'مسترجع';
  } else if (statusLower === 'ملغي' || statusLower === 'cancelled' || statusLower === 'canceled') {
    return 'ملغي';
  } else {
    return status || 'قيد الانتظار';
  }
};

/**
 * Get the database value for a payment status 
 * This ensures that we always store the status in the correct format in the database
 */
export const getDbPaymentStatus = (status: string): string => {
  const normalizedStatus = normalizePaymentStatus(status);
  
  // Return status values that will be stored in the database
  if (normalizedStatus === 'مدفوع') {
    return 'مدفوع';
  } else if (normalizedStatus === 'قيد الانتظار') {
    return 'قيد الانتظار';
  } else if (normalizedStatus === 'فشل') {
    return 'فشل';
  } else if (normalizedStatus === 'مسترجع') {
    return 'مسترجع';
  } else if (normalizedStatus === 'ملغي') {
    return 'ملغي';
  } else {
    return 'قيد الانتظار';
  }
};
