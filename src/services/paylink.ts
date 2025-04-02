
import { toast } from "sonner";

// PayLink Invoice creation response
export interface PaylinkInvoiceResponse {
  id: string;
  status: string;
  payment_status: string;
  url: string;
  amount: number;
  currency: string;
  invoice_id: string;
  reference_id: string;
  message?: string;
  success: boolean;
}

/**
 * Creates a payment invoice using PayLink.sa API
 * @param amount The amount to be charged in SAR
 * @param customerName The name of the customer
 * @param customerEmail The email of the customer
 * @param planName The name of the subscription plan
 * @returns Promise with the invoice data including the payment URL
 */
export const createPaylinkInvoice = async (
  amount: number, 
  customerName: string, 
  customerEmail: string,
  planName: string
): Promise<PaylinkInvoiceResponse> => {
  try {
    // Get the API key from the payment settings
    // In a production environment, this should be retrieved from the server
    const { data, error } = await fetch('/api/paylink-settings').then(res => res.json());
    
    if (error || !data?.apiKey) {
      console.error("Error fetching PayLink API Key:", error);
      throw new Error("تعذر الاتصال ببوابة الدفع. يرجى المحاولة مرة أخرى لاحقًا.");
    }
    
    const apiKey = data.apiKey;
    
    // Create invoice data
    const invoiceData = {
      amount: amount,
      callback_url: window.location.origin + "/payment/callback",
      cancel_url: window.location.origin + "/pricing",
      source_id: "dream_interpretation_app",
      order_id: `order_${Date.now()}`,
      products: [{
        name: `اشتراك ${planName}`,
        price: amount,
        quantity: 1
      }],
      success_url: window.location.origin + "/payment/success",
      client_info: {
        name: customerName,
        email: customerEmail,
      }
    };
    
    // Make API request to PayLink.sa
    const response = await fetch("https://restapi.paylink.sa/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify(invoiceData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("PayLink API Error:", result);
      throw new Error(result.message || "حدث خطأ أثناء إنشاء الفاتورة");
    }
    
    return {
      id: result.id,
      status: result.status,
      payment_status: result.payment_status,
      url: result.url,
      amount: result.amount,
      currency: result.currency,
      invoice_id: result.invoice_id,
      reference_id: result.reference_id,
      success: true
    };
  } catch (error) {
    console.error("Error creating PayLink invoice:", error);
    return {
      id: "",
      status: "error",
      payment_status: "failed",
      url: "",
      amount: 0,
      currency: "SAR",
      invoice_id: "",
      reference_id: "",
      message: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الفاتورة",
      success: false
    };
  }
};
