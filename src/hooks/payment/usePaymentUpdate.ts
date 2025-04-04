
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_STATUS } from '@/utils/payment/statusNormalizer';
import { toast } from 'sonner';

/**
 * Handle payment status updates and user subscription updates
 */
export const usePaymentUpdate = () => {
  const [paymentUpdated, setPaymentUpdated] = useState(false);
  
  const updatePendingPayments = async (userId: string, planType: string) => {
    if (!userId || !planType) return false;
    
    try {
      console.log("Updating pending payments for user:", userId, "and plan:", planType);
      
      const { error: updatePendingError } = await supabase
        .from('payment_invoices')
        .update({ 
          status: PAYMENT_STATUS.PAID,
          expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() 
        })
        .eq('user_id', userId)
        .eq('plan_name', planType)
        .or(`status.eq.${PAYMENT_STATUS.PENDING},status.eq.Pending,status.eq.pending`);
        
      if (updatePendingError) {
        console.error("Error updating payment statuses:", updatePendingError);
        return false;
      } else {
        console.log("Updated pending payments for user:", userId);
        setPaymentUpdated(true);
        return true;
      }
    } catch (error) {
      console.error("Error in updatePendingPayments:", error);
      return false;
    }
  };
  
  const updatePaymentByIdentifier = async (identifier: string, userId: string) => {
    if (!identifier || !userId) return false;
    
    try {
      const { error: updateError } = await supabase
        .from('payment_invoices')
        .update({ 
          status: PAYMENT_STATUS.PAID,
          expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() 
        })
        .eq('invoice_id', identifier)
        .eq('user_id', userId)
        .or(`status.eq.${PAYMENT_STATUS.PENDING},status.eq.Pending,status.eq.pending`);
        
      if (updateError) {
        console.error(`Error updating payment with identifier ${identifier}:`, updateError);
        return false;
      } else {
        console.log(`Updated payment with identifier ${identifier} to paid`);
        setPaymentUpdated(true);
        return true;
      }
    } catch (error) {
      console.error("Error in updatePaymentByIdentifier:", error);
      return false;
    }
  };
  
  const showSuccessToast = (planName: string) => {
    const displayName = planName.toLowerCase().includes('مميز') || 
                         planName === 'premium' 
      ? 'المميزة' 
      : 'الاحترافية';
      
    toast.success(`تم الاشتراك في الباقة ${displayName} بنجاح!`);
  };
  
  return {
    paymentUpdated,
    setPaymentUpdated,
    updatePendingPayments,
    updatePaymentByIdentifier,
    showSuccessToast
  };
};
