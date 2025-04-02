
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
    // Get the API key from the payment settings using the Edge Function
    const settingsResponse = await fetch(`${window.location.origin}/functions/v1/paylink-settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    
    if (!settingsResponse.ok) {
      console.error("Error fetching PayLink settings:", await settingsResponse.text());
      throw new Error("تعذر الاتصال ببوابة الدفع. يرجى المحاولة مرة أخرى لاحقًا.");
    }
    
    const settingsData = await settingsResponse.json();
    
    if (!settingsData.data?.apiKey) {
      console.error("PayLink API Key not found:", settingsData);
      throw new Error("تعذر الاتصال ببوابة الدفع. يرجى المحاولة مرة أخرى لاحقًا.");
    }
    
    const apiKey = settingsData.data.apiKey;
    
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayLink API Error Response:", errorText);
      try {
        // Only try to parse as JSON if it looks like JSON
        if (errorText.trim().startsWith('{')) {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || "حدث خطأ أثناء إنشاء الفاتورة");
        } else {
          throw new Error("حدث خطأ أثناء الاتصال بخدمة الدفع، يرجى المحاولة مرة أخرى لاحقًا");
        }
      } catch (e) {
        throw new Error("حدث خطأ أثناء إنشاء الفاتورة، يرجى المحاولة مرة أخرى لاحقًا");
      }
    }
    
    const result = await response.json();
    
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
