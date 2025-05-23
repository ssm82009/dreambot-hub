
import { supabase } from "@/integrations/supabase/client";
import { normalizePaymentStatus } from "./statusNormalizer";

/**
 * Find invoice by transaction identifiers
 * @returns Found invoice ID if matched, empty string otherwise
 */
export const findInvoiceByIdentifiers = async (
  identifiers: string[]
): Promise<{ invoiceId: string; foundInvoice: boolean }> => {
  console.log("Looking for invoice with identifiers:", identifiers);
  
  if (identifiers.length === 0) {
    return { invoiceId: "", foundInvoice: false };
  }
  
  try {
    // بناء استعلام البحث عن الفاتورة باستخدام OR لكل معرّف
    const { data: invoices, error: findError } = await supabase
      .from('payment_invoices')
      .select('*')
      .in('invoice_id', identifiers);
    
    if (findError) {
      console.error("Error finding invoice:", findError);
      return { invoiceId: "", foundInvoice: false };
    } 
    
    if (invoices && invoices.length > 0) {
      console.log("Found matching invoices:", invoices);
      // Sort by created_at in descending order to get the latest invoice
      const sortedInvoices = invoices.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const invoiceId = sortedInvoices[0].id;
      
      // تحديث حالة الفاتورة في قاعدة البيانات إلى "مدفوع" عند التحقق من الدفع
      const { error: updateInvoiceError } = await supabase
        .from('payment_invoices')
        .update({ status: 'مدفوع' })
        .eq('id', invoiceId);
        
      if (updateInvoiceError) {
        console.error("Error updating invoice status:", updateInvoiceError);
      } else {
        console.log("Updated invoice status to مدفوع for invoice:", sortedInvoices[0].invoice_id);
      }
      
      return { invoiceId, foundInvoice: true };
    }
  } catch (error) {
    console.error("Error in findInvoiceByIdentifiers:", error);
  }
  
  return { invoiceId: "", foundInvoice: false };
};

/**
 * Find user's pending invoice by user ID and plan type
 */
export const findPendingInvoiceByUserPlan = async (
  userId: string,
  plan: string
): Promise<{ invoiceId: string; foundInvoice: boolean }> => {
  console.log("Looking for invoices for user:", userId, "and plan:", plan);
  
  try {
    // البحث عن جميع الفواتير للمستخدم والخطة المحددة
    const { data: userInvoices, error: userInvoicesError } = await supabase
      .from('payment_invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_name', plan)
      .order('created_at', { ascending: false });
      
    if (userInvoicesError) {
      console.error("Error finding user invoices:", userInvoicesError);
      return { invoiceId: "", foundInvoice: false };
    } 
    
    if (userInvoices && userInvoices.length > 0) {
      console.log("Found invoices for user:", userInvoices);
      const invoiceId = userInvoices[0].id;
      
      // تحديث حالة الفاتورة في قاعدة البيانات إلى "مدفوع" عند التحقق
      const { error: updateInvoiceError } = await supabase
        .from('payment_invoices')
        .update({ status: 'مدفوع' })
        .eq('id', invoiceId);
        
      if (updateInvoiceError) {
        console.error("Error updating user invoice status:", updateInvoiceError);
      } else {
        console.log("Updated user invoice status to مدفوع for invoice:", userInvoices[0].invoice_id);
      }
      
      return { invoiceId, foundInvoice: true };
    }
  } catch (error) {
    console.error("Error in findPendingInvoiceByUserPlan:", error);
  }
  
  return { invoiceId: "", foundInvoice: false };
};

/**
 * Create a new PayPal invoice record if no matching invoice is found
 */
export const createPayPalInvoiceRecord = async (
  txnId: string,
  userId: string,
  plan: string,
  pricingSettings: any
): Promise<string> => {
  if (!txnId || !plan) {
    return "";
  }
  
  try {
    console.log("Creating new PayPal invoice record for txnId:", txnId);
    
    // تحديد المبلغ بناءً على نوع الخطة
    let amount = 0;
    let planName = plan;
    
    // Normalize the plan name to database format
    if (plan.toLowerCase().includes('مميز') || plan.toLowerCase() === 'premium') {
      planName = 'premium';
      amount = pricingSettings?.premium_plan_price || 49;
    } else if (plan.toLowerCase().includes('احترافي') || plan.toLowerCase() === 'pro') {
      planName = 'pro';
      amount = pricingSettings?.pro_plan_price || 99;
    }
    
    // Check if an invoice already exists with this txnId
    const { data: existingInvoices, error: existingError } = await supabase
      .from('payment_invoices')
      .select('*')
      .eq('invoice_id', txnId);
      
    if (existingError) {
      console.error("Error checking existing invoices:", existingError);
    }
    
    if (existingInvoices && existingInvoices.length > 0) {
      // Update the existing invoice instead of creating a new one
      const { data: updatedInvoice, error: updateError } = await supabase
        .from('payment_invoices')
        .update({
          status: 'مدفوع', // Always set to paid
          user_id: userId,
          plan_name: planName,
          payment_method: 'paypal',
          amount: amount
        })
        .eq('id', existingInvoices[0].id)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating existing invoice:", updateError);
      } else {
        console.log("Updated existing invoice to paid status:", updatedInvoice);
        return updatedInvoice.id;
      }
    } else {
      // إنشاء سجل جديد بناءً على معلومات PayPal - دائماً بحالة "مدفوع"
      const { data: newInvoice, error: newInvoiceError } = await supabase
        .from('payment_invoices')
        .insert({
          invoice_id: txnId,
          user_id: userId,
          plan_name: planName,
          status: 'مدفوع', // Set directly to paid since we're on success page
          payment_method: 'paypal',
          amount: amount
        })
        .select()
        .single();
        
      if (newInvoiceError) {
        console.error("Error creating new invoice:", newInvoiceError);
        return "";
      } 
      
      if (newInvoice) {
        console.log("Created new payment record from PayPal data with ID:", newInvoice.id);
        return newInvoice.id;
      }
    }
  } catch (error) {
    console.error("Error in createPayPalInvoiceRecord:", error);
  }
  
  return "";
};

/**
 * Update all pending invoices for a user and plan to paid status
 */
export const updateAllPendingInvoices = async (userId: string, plan: string): Promise<void> => {
  try {
    // تحديث جميع الفواتير للمستخدم والخطة المحددة إلى "مدفوع"
    const { error: updateAllInvoicesError } = await supabase
      .from('payment_invoices')
      .update({ status: 'مدفوع' })
      .eq('user_id', userId)
      .eq('plan_name', plan);
      
    if (updateAllInvoicesError) {
      console.error("Error updating related invoices:", updateAllInvoicesError);
    } else {
      console.log("Updated all invoices for user:", userId, "and plan:", plan, "to مدفوع");
    }
  } catch (error) {
    console.error("Error in updateAllPendingInvoices:", error);
  }
};

/**
 * Get the latest payment status for a specific invoice_id
 */
export const getLatestPaymentStatus = async (invoiceId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('payment_invoices')
      .select('status')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error("Error getting latest payment status:", error);
      return "قيد الانتظار"; // Default to pending
    }
    
    return data?.status || "قيد الانتظار";
  } catch (error) {
    console.error("Error in getLatestPaymentStatus:", error);
    return "قيد الانتظار";
  }
};
