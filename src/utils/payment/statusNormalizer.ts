
/**
 * Normalize payment status strings to standard Arabic terms
 */
export const normalizePaymentStatus = (status: string | null | undefined): string => {
  if (!status) return 'غير معروف';
  
  const statusLower = status.toLowerCase();
  
  // أولوية "مدفوع" أعلى من غيرها من الحالات
  if (statusLower === 'paid' || statusLower === 'مدفوع' || statusLower.includes('مدفوع') || 
      statusLower === 'success' || statusLower === 'sucsess' || statusLower.includes('نجاح')) {
    return 'مدفوع';
  } 
  // إذا كانت حالة من حالات الانتظار
  else if (statusLower === 'pending' || statusLower === 'قيد الانتظار' || statusLower.includes('انتظار')) {
    return 'قيد الانتظار';
  } 
  // إذا كانت حالة فشل
  else if (statusLower === 'failed' || statusLower === 'فشل' || statusLower.includes('فشل')) {
    return 'فشل';
  } 
  // إذا كانت حالة استرجاع
  else if (statusLower === 'refunded' || statusLower === 'مسترجع' || statusLower.includes('استرجاع')) {
    return 'مسترجع';
  } 
  // إذا كانت حالة إلغاء
  else if (statusLower === 'cancelled' || statusLower === 'ملغي' || statusLower.includes('الغاء')) {
    return 'ملغي';
  }
  
  return status; // Return original if no mapping found
};

/**
 * Basic normalization for plan types (used for internal matching, not display)
 */
export const normalizePlanType = (planName: string | null | undefined): string => {
  if (!planName) return 'free';
  
  const planLower = planName.toLowerCase();
  
  if (planLower.includes('premium') || planLower.includes('مميز')) {
    return 'premium';
  } else if (planLower.includes('pro') || planLower.includes('احترافي')) {
    return 'pro';
  } else if (planLower.includes('free') || planLower.includes('مجاني')) {
    return 'free';
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

/**
 * Alias for normalizePlanType for backward compatibility
 */
export const normalizePlanName = normalizePlanType;
