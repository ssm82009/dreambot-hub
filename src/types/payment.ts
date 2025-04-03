
/**
 * أنواع البيانات المستخدمة في نظام الدفع
 */

/**
 * معلومات العميل للدفع
 */
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
}

/**
 * حالات الدفع
 */
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Canceled' | 'Refunded';

/**
 * طرق الدفع المدعومة
 */
export type PaymentMethod = 'paylink' | 'paypal';
