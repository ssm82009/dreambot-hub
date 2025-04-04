import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { verifyPayment } from '@/utils/payment/verifyPayment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { normalizePaymentStatus, PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';

export const usePaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  
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
  
  useEffect(() => {
    const handleVerification = async () => {
      try {
        setIsVerifying(true);
        
        console.log("Payment verification search params:", Object.fromEntries(searchParams.entries()));
        
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (!userId) {
          console.error("No authenticated user found");
          setIsVerifying(false);
          return;
        }

        let foundPaymentSession = null;
        
        if (sessionId) {
          console.log("Looking for payment record by session_id:", sessionId);
          
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('payment_invoices')
            .select('*')
            .eq('invoice_id', sessionId)
            .eq('user_id', userId)
            .single();
            
          if (!invoiceError && invoiceData) {
            console.log("Found payment record by session_id:", invoiceData);
            
            foundPaymentSession = {
              id: invoiceData.id,
              user_id: invoiceData.user_id,
              plan_type: invoiceData.plan_name,
              amount: invoiceData.amount,
              session_id: invoiceData.invoice_id,
              transaction_identifier: transactionIdentifier,
              payment_method: invoiceData.payment_method,
              created_at: invoiceData.created_at,
              status: isSuccessPage ? PAYMENT_STATUS.PAID : invoiceData.status
            };
            
            await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('id', invoiceData.id);
          } else {
            console.log("No payment record found by session_id, trying transaction ID");
          }
        }
        
        if (!foundPaymentSession && transactionIdentifier) {
          console.log("Looking for payment record by transaction_identifier:", transactionIdentifier);
          
          const { data: invoiceByTxData, error: invoiceByTxError } = await supabase
            .from('payment_invoices')
            .select('*')
            .eq('invoice_id', transactionIdentifier)
            .eq('user_id', userId)
            .single();
            
          if (!invoiceByTxError && invoiceByTxData) {
            console.log("Found payment record by transaction_identifier:", invoiceByTxData);
            
            foundPaymentSession = {
              id: invoiceByTxData.id,
              user_id: invoiceByTxData.user_id,
              plan_type: invoiceByTxData.plan_name,
              amount: invoiceByTxData.amount,
              session_id: invoiceByTxData.invoice_id,
              transaction_identifier: transactionIdentifier,
              payment_method: invoiceByTxData.payment_method,
              created_at: invoiceByTxData.created_at,
              status: isSuccessPage ? PAYMENT_STATUS.PAID : invoiceByTxData.status
            };
            
            await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('id', invoiceByTxData.id);
          } else {
            console.log("No payment record found by transaction_identifier");
          }
        }
        
        if (!foundPaymentSession) {
          console.log("Looking for latest pending payment record for user:", userId);
          
          const { data: latestInvoiceData, error: latestInvoiceError } = await supabase
            .from('payment_invoices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!latestInvoiceError && latestInvoiceData) {
            console.log("Found latest payment record:", latestInvoiceData);
            
            foundPaymentSession = {
              id: latestInvoiceData.id,
              user_id: latestInvoiceData.user_id,
              plan_type: latestInvoiceData.plan_name,
              amount: latestInvoiceData.amount,
              session_id: latestInvoiceData.invoice_id,
              transaction_identifier: transactionIdentifier,
              payment_method: latestInvoiceData.payment_method,
              created_at: latestInvoiceData.created_at,
              status: isSuccessPage ? PAYMENT_STATUS.PAID : latestInvoiceData.status
            };
            
            await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('id', latestInvoiceData.id);
          } else {
            console.log("No payment records found for user");
          }
        }
        
        if (!foundPaymentSession) {
          console.error("No payment session found for verification");
          setIsVerifying(false);
          return;
        }
        
        setPaymentSession(foundPaymentSession);
        
        await verifyPayment(
          transactionIdentifier || (foundPaymentSession.session_id || ''),
          customId,
          txnId,
          foundPaymentSession.plan_type
        );
        
        const { error: updateError } = await supabase
          .from('payment_invoices')
          .update({ status: PAYMENT_STATUS.PAID })
          .eq('user_id', userId)
          .eq('plan_name', foundPaymentSession.plan_type);
          
        if (updateError) {
          console.error("خطأ في تحديث حالات الدفع:", updateError);
        } else {
          console.log("تم تحديث جميع حالات الدفع للمستخدم:", userId);
        }
        
        const planName = foundPaymentSession.plan_type.toLowerCase().includes('مميز') || 
                         foundPaymentSession.plan_type === 'premium' 
          ? 'المميزة' 
          : 'الاحترافية';
          
        toast.success(`تم الاشتراك في الباقة ${planName} بنجاح!`);
      } catch (error) {
        console.error("Error in payment verification:", error);
        toast.error("حدث خطأ في التحقق من الدفع. يرجى الاتصال بالدعم الفني.");
      } finally {
        setIsVerifying(false);
      }
    };

    if (sessionId || transactionIdentifier || isSuccessPage) {
      handleVerification();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, transactionIdentifier, customId, txnId, searchParams, payerID, isSuccessPage]);

  return {
    paymentSession,
    transactionIdentifier: transactionIdentifier || (paymentSession?.transaction_identifier || ''),
    isVerifying,
    sessionId,
    isSuccessPage
  };
};
