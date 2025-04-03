
import { getPaylinkInvoiceStatus } from '@/services/paylinkService';

/**
 * Verify PayLink payment status
 */
export const verifyPaylinkPayment = async (
  payLinkTransactionNumber: string,
  paylinkApiKey: string,
  paylinkSecretKey: string
): Promise<string | null> => {
  if (!payLinkTransactionNumber || !paylinkApiKey || !paylinkSecretKey) {
    return null;
  }
  
  try {
    // التحقق من حالة الدفع باستخدام API (للتوثيق فقط)
    const status = await getPaylinkInvoiceStatus(
      paylinkApiKey,
      paylinkSecretKey,
      payLinkTransactionNumber
    );
    
    if (status) {
      console.log(`حالة الدفع من PayLink API: ${status}`);
      return status;
    }
  } catch (error) {
    console.error("Error verifying PayLink payment:", error);
  }
  
  return null;
};
