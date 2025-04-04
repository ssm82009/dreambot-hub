
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';

export const usePaymentStatus = (
  paymentData: any,
  transactionIdentifier: string
) => {
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const location = useLocation();
  const isSuccessPage = location.pathname.includes('success');
  
  useEffect(() => {
    const updatePaymentStatus = async () => {
      const paidStatus = PAYMENT_STATUS.PAID;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          console.error("No authenticated user found");
          return;
        }
        
        console.log("Updating payment status for user:", session.user.id);
        
        // Only update status for current payment on success page
        if (isSuccessPage) {
          // Approach 1: Update by paymentData.id if available
          if (paymentData?.id && (paymentData.status === PAYMENT_STATUS.PENDING || paymentData.status === 'pending' || paymentData.status === 'Pending')) {
            try {
              const { data, error } = await supabase
                .from('payment_invoices')
                .update({ status: paidStatus })
                .eq('id', paymentData.id)
                .eq('user_id', session.user.id);
                
              if (!error) {
                console.log(`Updated payment status for ID ${paymentData.id} to مدفوع`);
                setUpdateSuccess(true);
              } else {
                console.error("Error updating payment status by ID:", error);
              }
            } catch (error) {
              console.error("Exception updating payment status by ID:", error);
            }
          }
          
          // Approach 2: Update by invoice_id if available
          if (paymentData?.invoice_id && (paymentData.status === PAYMENT_STATUS.PENDING || paymentData.status === 'pending' || paymentData.status === 'Pending')) {
            try {
              const { data, error } = await supabase
                .from('payment_invoices')
                .update({ status: paidStatus })
                .eq('invoice_id', paymentData.invoice_id)
                .eq('user_id', session.user.id)
                .eq('status', PAYMENT_STATUS.PENDING);
                
              if (!error) {
                console.log(`Updated all payment records with invoice_id ${paymentData.invoice_id} to مدفوع`);
                setUpdateSuccess(true);
              } else {
                console.error(`Error updating by invoice_id ${paymentData.invoice_id}:`, error);
              }
            } catch (error) {
              console.error(`Exception updating by invoice_id ${paymentData.invoice_id}:`, error);
            }
          }
          
          // Approach 3: Update by transactionIdentifier if available
          if (transactionIdentifier && !paymentData) {
            try {
              const { data, error } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', transactionIdentifier)
                .eq('user_id', session.user.id)
                .eq('status', PAYMENT_STATUS.PENDING);
                
              if (!error && data && data.length > 0) {
                const { error: updateError } = await supabase
                  .from('payment_invoices')
                  .update({ status: paidStatus })
                  .eq('invoice_id', transactionIdentifier)
                  .eq('user_id', session.user.id)
                  .eq('status', PAYMENT_STATUS.PENDING);
                  
                if (!updateError) {
                  console.log(`Updated records with transactionIdentifier ${transactionIdentifier} to مدفوع`);
                  setUpdateSuccess(true);
                } else {
                  console.error(`Error updating by transactionIdentifier ${transactionIdentifier}:`, updateError);
                }
              }
            } catch (error) {
              console.error(`Exception updating by transactionIdentifier ${transactionIdentifier}:`, error);
            }
          }
        }
      } catch (error) {
        console.error("General error in updatePaymentStatus:", error);
      }
    };
    
    updatePaymentStatus();
  }, [paymentData, transactionIdentifier, isSuccessPage]);

  // Define normalized status safely
  const normalizedStatus = isSuccessPage && paymentData?.status === PAYMENT_STATUS.PENDING 
    ? PAYMENT_STATUS.PAID 
    : paymentData?.status || '';

  return { updateSuccess, normalizedStatus };
};
