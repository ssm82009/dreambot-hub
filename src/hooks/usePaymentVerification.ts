
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyPayment } from '@/utils/payment/verifyPayment';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  
  // PayLink params
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  
  // PayPal params
  const invoiceId = searchParams.get('invoice_id') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const token = searchParams.get('token') || '';
  const customId = searchParams.get('custom') || ''; // PayPal custom field (contains our invoiceId)
  const txnId = searchParams.get('tx') || ''; // PayPal transaction ID
  
  // Get any available transaction identifier
  const transactionIdentifier = transactionNo || orderNumber || invoiceId || customId || token || paymentId || txnId;
  
  useEffect(() => {
    const handleVerification = async () => {
      // تحديث حالة الاشتراك في localStorage
      const plan = localStorage.getItem('pendingSubscriptionPlan');
      if (plan) {
        localStorage.setItem('subscriptionType', plan);
        localStorage.removeItem('pendingSubscriptionPlan');
        
        // تسجيل معرّف العملية في سجل المطور
        console.log("Payment success with transaction ID:", transactionIdentifier);
        
        // Verify the payment in the database
        await verifyPayment(transactionIdentifier, customId, txnId, plan);
      }
    };

    handleVerification();
  }, [transactionIdentifier, customId, txnId]);

  return { transactionIdentifier };
};
