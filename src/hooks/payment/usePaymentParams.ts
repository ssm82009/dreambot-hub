
import { useSearchParams, useLocation } from 'react-router-dom';

/**
 * Extract payment-related parameters from the URL
 */
export const usePaymentParams = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const isSuccessPage = location.pathname.includes('success');
  
  const sessionId = searchParams.get('session_id') || '';
  const transactionNo = searchParams.get('transactionNo') || '';
  const orderNumber = searchParams.get('order_number') || '';
  const paymentId = searchParams.get('paymentId') || '';
  const token = searchParams.get('token') || '';
  const customId = searchParams.get('custom') || '';
  const txnId = searchParams.get('tx') || '';
  const payerID = searchParams.get('PayerID') || '';
  
  const transactionIdentifier = transactionNo || orderNumber || paymentId || token || txnId || customId;
  
  return {
    sessionId,
    transactionIdentifier,
    customId,
    txnId,
    payerID,
    isSuccessPage,
    searchParams
  };
};
