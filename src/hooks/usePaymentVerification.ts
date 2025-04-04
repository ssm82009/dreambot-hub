
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
  const [paymentUpdated, setPaymentUpdated] = useState(false);
  
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
              status: invoiceData.status
            };
            
            // Only update pending payments
            if (invoiceData.status === PAYMENT_STATUS.PENDING || invoiceData.status === 'pending' || invoiceData.status === 'Pending') {
              const { error: updateError } = await supabase
                .from('payment_invoices')
                .update({ status: PAYMENT_STATUS.PAID })
                .eq('id', invoiceData.id);
                
              if (!updateError) {
                setPaymentUpdated(true);
                console.log("Updated payment status for invoice with ID:", invoiceData.id);
              } else {
                console.error("Failed to update payment status:", updateError);
              }
            }
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
              status: invoiceByTxData.status
            };
            
            // Only update pending payments
            if (invoiceByTxData.status === PAYMENT_STATUS.PENDING || invoiceByTxData.status === 'pending' || invoiceByTxData.status === 'Pending') {
              const { error: updateError } = await supabase
                .from('payment_invoices')
                .update({ status: PAYMENT_STATUS.PAID })
                .eq('id', invoiceByTxData.id);
                
              if (!updateError) {
                setPaymentUpdated(true);
                console.log("Updated payment status for invoice with ID:", invoiceByTxData.id);
              } else {
                console.error("Failed to update payment status:", updateError);
              }
            }
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
            .eq('status', PAYMENT_STATUS.PENDING)
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
              status: latestInvoiceData.status
            };
            
            const { error: updateError } = await supabase
              .from('payment_invoices')
              .update({ status: PAYMENT_STATUS.PAID })
              .eq('id', latestInvoiceData.id);
              
            if (!updateError) {
              setPaymentUpdated(true);
              console.log("Updated payment status for latest invoice with ID:", latestInvoiceData.id);
            } else {
              console.error("Failed to update payment status:", updateError);
            }
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
        
        // تحديث المدفوعات المعلقة فقط
        if (isSuccessPage) {
          const { error: updatePendingError } = await supabase
            .from('payment_invoices')
            .update({ 
              status: PAYMENT_STATUS.PAID,
              expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() 
            })
            .eq('user_id', userId)
            .eq('plan_name', foundPaymentSession.plan_type)
            .or(`status.eq.${PAYMENT_STATUS.PENDING},status.eq.Pending,status.eq.pending`);
            
          if (updatePendingError) {
            console.error("خطأ في تحديث حالات الدفع:", updatePendingError);
          } else {
            console.log("تم تحديث حالات الدفع المعلقة للمستخدم:", userId);
            setPaymentUpdated(true);
          }
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

    if ((sessionId || transactionIdentifier || isSuccessPage) && isSuccessPage) {
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
    isSuccessPage,
    paymentUpdated
  };
};
