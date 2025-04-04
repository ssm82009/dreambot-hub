
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_STATUS, normalizePaymentStatus } from '@/utils/payment/statusNormalizer';

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
          let updateOccurred = false;
          
          // Approach 1: Update by paymentData.id if available
          if (paymentData?.id && (
              paymentData.status === PAYMENT_STATUS.PENDING || 
              paymentData.status === 'pending' || 
              paymentData.status === 'Pending' || 
              paymentData.status === 'قيد الانتظار'
            )) {
            try {
              const { error } = await supabase
                .from('payment_invoices')
                .update({ 
                  status: paidStatus,
                  expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
                })
                .eq('id', paymentData.id)
                .eq('user_id', session.user.id);
                
              if (!error) {
                console.log(`Updated payment status for ID ${paymentData.id} to مدفوع`);
                updateOccurred = true;
              } else {
                console.error("Error updating payment status by ID:", error);
              }
            } catch (error) {
              console.error("Exception updating payment status by ID:", error);
            }
          }
          
          // Approach 2: Update by invoice_id if available
          if (paymentData?.invoice_id && (
              paymentData.status === PAYMENT_STATUS.PENDING || 
              paymentData.status === 'pending' || 
              paymentData.status === 'Pending' || 
              paymentData.status === 'قيد الانتظار'
            )) {
            try {
              const { error } = await supabase
                .from('payment_invoices')
                .update({ 
                  status: paidStatus,
                  expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
                })
                .eq('invoice_id', paymentData.invoice_id)
                .eq('user_id', session.user.id);
                
              if (!error) {
                console.log(`Updated all payment records with invoice_id ${paymentData.invoice_id} to مدفوع`);
                updateOccurred = true;
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
              const { data } = await supabase
                .from('payment_invoices')
                .select('*')
                .eq('invoice_id', transactionIdentifier)
                .eq('user_id', session.user.id);
                
              if (data && data.length > 0) {
                const pendingInvoices = data.filter(invoice => 
                  invoice.status === PAYMENT_STATUS.PENDING || 
                  invoice.status === 'pending' || 
                  invoice.status === 'Pending' || 
                  invoice.status === 'قيد الانتظار'
                );
                
                if (pendingInvoices.length > 0) {
                  const { error } = await supabase
                    .from('payment_invoices')
                    .update({ 
                      status: paidStatus,
                      expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString()
                    })
                    .eq('invoice_id', transactionIdentifier)
                    .eq('user_id', session.user.id);
                    
                  if (!error) {
                    console.log(`Updated records with transactionIdentifier ${transactionIdentifier} to مدفوع`);
                    updateOccurred = true;
                  } else {
                    console.error(`Error updating by transactionIdentifier ${transactionIdentifier}:`, error);
                  }
                }
              }
            } catch (error) {
              console.error(`Exception updating by transactionIdentifier ${transactionIdentifier}:`, error);
            }
          }
          
          // If any update occurred, also update the subscription
          if (updateOccurred) {
            try {
              // Determine the plan type
              let planType = null;
              if (paymentData?.plan_name) {
                planType = paymentData.plan_name;
              } else if (transactionIdentifier) {
                const { data } = await supabase
                  .from('payment_invoices')
                  .select('plan_name')
                  .eq('invoice_id', transactionIdentifier)
                  .limit(1);
                  
                if (data && data.length > 0) {
                  planType = data[0].plan_name;
                }
              }
              
              if (planType) {
                // Update user subscription directly
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                const { error } = await supabase
                  .from('users')
                  .update({ 
                    subscription_type: planType,
                    subscription_expires_at: expiryDate.toISOString()
                  })
                  .eq('id', session.user.id);
                  
                if (!error) {
                  console.log(`Updated user subscription to ${planType}`);
                  setUpdateSuccess(true);
                } else {
                  console.error("Error updating user subscription:", error);
                }
              }
            } catch (error) {
              console.error("Exception updating user subscription:", error);
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
  const normalizedStatus = isSuccessPage && (
    paymentData?.status === PAYMENT_STATUS.PENDING || 
    paymentData?.status === 'pending' || 
    paymentData?.status === 'Pending' || 
    paymentData?.status === 'قيد الانتظار'
  ) 
    ? PAYMENT_STATUS.PAID 
    : normalizePaymentStatus(paymentData?.status || '');

  return { updateSuccess, normalizedStatus };
};
