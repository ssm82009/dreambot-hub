
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';

/**
 * Lookup and retrieve payment session data from the database
 */
export const usePaymentSession = () => {
  const [paymentSession, setPaymentSession] = useState<any>(null);
  
  const findSessionBySessionId = async (sessionId: string, userId: string) => {
    if (!sessionId) return null;
    
    console.log("Looking for payment record by session_id:", sessionId);
    
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('payment_invoices')
      .select('*')
      .eq('invoice_id', sessionId)
      .eq('user_id', userId)
      .single();
      
    if (!invoiceError && invoiceData) {
      console.log("Found payment record by session_id:", invoiceData);
      
      return {
        id: invoiceData.id,
        user_id: invoiceData.user_id,
        plan_type: invoiceData.plan_name,
        amount: invoiceData.amount,
        session_id: invoiceData.invoice_id,
        transaction_identifier: null,
        payment_method: invoiceData.payment_method,
        created_at: invoiceData.created_at,
        status: invoiceData.status
      };
    }
    
    return null;
  };
  
  const findSessionByTransactionId = async (transactionIdentifier: string, userId: string) => {
    if (!transactionIdentifier) return null;
    
    console.log("Looking for payment record by transaction_identifier:", transactionIdentifier);
    
    const { data: invoiceByTxData, error: invoiceByTxError } = await supabase
      .from('payment_invoices')
      .select('*')
      .eq('invoice_id', transactionIdentifier)
      .eq('user_id', userId)
      .single();
      
    if (!invoiceByTxError && invoiceByTxData) {
      console.log("Found payment record by transaction_identifier:", invoiceByTxData);
      
      return {
        id: invoiceByTxData.id,
        user_id: invoiceByTxData.user_id,
        plan_type: invoiceByTxData.plan_name,
        amount: invoiceByTxData.amount,
        session_id: invoiceByTxData.invoice_id,
        transaction_identifier: transactionIdentifier,
        payment_method: invoiceByTxData.payment_method,
        created_at: invoiceByTxData.created_at,
        status: invoiceByTxData.status
      };
    }
    
    return null;
  };
  
  const findLatestPendingSession = async (userId: string) => {
    console.log("Looking for latest pending payment record for user:", userId);
    
    const { data: latestInvoiceData, error: latestInvoiceError } = await supabase
      .from('payment_invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('status', PAYMENT_STATUS.PENDING)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!latestInvoiceError && latestInvoiceData) {
      console.log("Found latest payment record:", latestInvoiceData);
      
      return {
        id: latestInvoiceData.id,
        user_id: latestInvoiceData.user_id,
        plan_type: latestInvoiceData.plan_name,
        amount: latestInvoiceData.amount,
        session_id: latestInvoiceData.invoice_id,
        transaction_identifier: null,
        payment_method: latestInvoiceData.payment_method,
        created_at: latestInvoiceData.created_at,
        status: latestInvoiceData.status
      };
    }
    
    return null;
  };
  
  const updateSessionStatus = async (sessionId: string, status: string = PAYMENT_STATUS.PAID) => {
    if (!sessionId) return false;
    
    const { error: updateError } = await supabase
      .from('payment_invoices')
      .update({ status })
      .eq('id', sessionId);
      
    if (!updateError) {
      console.log("Updated payment status for invoice with ID:", sessionId);
      return true;
    } else {
      console.error("Failed to update payment status:", updateError);
      return false;
    }
  };
  
  return {
    paymentSession,
    setPaymentSession,
    findSessionBySessionId,
    findSessionByTransactionId,
    findLatestPendingSession,
    updateSessionStatus
  };
};
