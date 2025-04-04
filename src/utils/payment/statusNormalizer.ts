

/**
 * Normalize payment status strings to standard Arabic terms
 */
export const normalizePaymentStatus = (status: string | null | undefined): string => {
  if (!status) return 'غير معروف';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'paid' || statusLower === 'مدفوع' || statusLower.includes('مدفوع')) {
    return 'مدفوع';
  } else if (statusLower === 'pending' || statusLower === 'قيد الانتظار' || statusLower.includes('انتظار')) {
    return 'قيد الانتظار';
  } else if (statusLower === 'failed' || statusLower === 'فشل' || statusLower.includes('فشل')) {
    return 'فشل';
  } else if (statusLower === 'refunded' || statusLower === 'مسترجع' || statusLower.includes('استرجاع')) {
    return 'مسترجع';
  } else if (statusLower === 'cancelled' || statusLower === 'ملغي' || statusLower.includes('الغاء')) {
    return 'ملغي';
  }
  
  return status; // Return original if no mapping found
};

/**
 * Normalize plan name strings
 */
export const normalizePlanName = (planName: string | null | undefined): string => {
  if (!planName) return 'غير معروف';
  
  const planLower = planName.toLowerCase();
  
  // Map old plan name "الاحترافي" to "الاحترافية"
  if (planLower === 'pro' || planLower === 'احترافي' || planLower === 'الاحترافي') {
    return 'الاحترافية';
  } else if (planLower === 'premium' || planLower === 'مميز' || planLower === 'المميز') {
    return 'المميزة';
  } else if (planLower === 'free' || planLower === 'مجاني' || planLower === 'المجاني') {
    return 'المجانية';
  }
  
  return planName; // Return original if no mapping found
};

/**
 * Normalize payment method strings
 */
export const normalizePaymentMethod = (method: string | null | undefined): string => {
  if (!method) return 'غير معروف';
  
  const methodLower = method.toLowerCase();
  
  if (methodLower === 'paylink' || methodLower.includes('paylink')) {
    return 'باي لينك';
  } else if (methodLower === 'paypal' || methodLower.includes('paypal')) {
    return 'باي بال';
  } else if (methodLower === 'manual' || methodLower.includes('manual')) {
    return 'يدوي';
  }
  
  return method; // Return original if no mapping found
};

