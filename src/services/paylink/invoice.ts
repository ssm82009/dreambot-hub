
import { toast } from "sonner";
import { PaylinkInvoice, InvoiceRequestData } from "./types";
import { getApiBaseUrl, API_PATHS, PAYLINK_REDIRECT_URL, PAYLINK_REDIRECT_URL_CANCEL } from "./config";
import { getAuthToken } from "./auth";

/**
 * Create a new PayLink invoice
 * @param apiKey - The PayLink API key
 * @param secretKey - The PayLink secret key
 * @param amount - The invoice amount
 * @param planName - The plan name
 * @param customerName - The customer name
 * @param customerEmail - The customer email
 * @param customerPhone - The customer phone
 * @returns The created invoice or null if creation fails
 */
export const createPaylinkInvoice = async (
  apiKey: string,
  secretKey: string,
  amount: number,
  planName: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Promise<PaylinkInvoice | null> => {
  try {
    // Get authentication token first
    const authToken = await getAuthToken(apiKey, secretKey);
    if (!authToken) {
      throw new Error("فشل في الحصول على رمز المصادقة");
    }

    // Determine appropriate environment based on API key
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    const apiBase = getApiBaseUrl(apiKey);
    
    console.log(`Using PayLink in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Invoice URL: ${apiBase}${API_PATHS.invoice}`);

    // Create unique order number
    const orderNumber = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Log request data for diagnosis
    console.log("Creating PayLink invoice with data:", {
      planName,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      orderNumber
    });

    // Prepare request with customer and product data as in the PHP code
    const requestData: InvoiceRequestData = {
      orderNumber: orderNumber,
      amount: amount,
      callBackUrl: PAYLINK_REDIRECT_URL,
      cancelUrl: PAYLINK_REDIRECT_URL_CANCEL,
      clientName: customerName,
      clientEmail: customerEmail,
      clientMobile: customerPhone,
      currency: "SAR",
      products: [
        {
          title: `اشتراك في باقة ${planName}`,
          price: amount,
          qty: 1
        }
      ]
    };

    console.log("Request data:", JSON.stringify(requestData));

    // Send request to create new invoice
    const response = await fetch(`${apiBase}${API_PATHS.invoice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // Check server response
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (jsonError) {
        errorText = await response.text();
      }
      
      console.error("PayLink API error:", errorText);
      throw new Error(`فشل في إنشاء فاتورة PayLink: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PayLink invoice created:", data);
    
    // Check data received from PayLink
    if (!data.url) {
      throw new Error("استجابة PayLink غير صالحة - لم يتم العثور على رابط الدفع");
    }

    // Convert response to standardized format
    return {
      payment_url: data.url,
      url: data.url,
      orderNumber: orderNumber,
      transactionNo: data.transactionNo || '',
      amount: amount,
      currency_code: "SAR"
    };
  } catch (error) {
    console.error("Error creating PayLink invoice:", error);
    toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء فاتورة الدفع");
    return null;
  }
};

/**
 * Query invoice status
 * @param apiKey - The PayLink API key
 * @param secretKey - The PayLink secret key
 * @param transactionNo - The transaction number
 * @returns The invoice status or null if query fails
 */
export const getPaylinkInvoiceStatus = async (
  apiKey: string, 
  secretKey: string,
  transactionNo: string
): Promise<string | null> => {
  try {
    // Get authentication token first
    const authToken = await getAuthToken(apiKey, secretKey);
    if (!authToken) {
      throw new Error("فشل في الحصول على رمز المصادقة");
    }

    // Determine appropriate environment based on API key
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    const apiBase = getApiBaseUrl(apiKey);
    
    console.log(`Getting invoice status in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Get Invoice URL: ${apiBase}${API_PATHS.getInvoice}/${transactionNo}`);

    // Send request to get invoice status
    const response = await fetch(`${apiBase}${API_PATHS.getInvoice}/${transactionNo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`فشل في الاستعلام عن حالة الفاتورة: ${response.status}`);
    }

    const data = await response.json();
    console.log("PayLink invoice status:", data);
    
    // Return order status
    return data.orderStatus || null;
  } catch (error) {
    console.error("Error checking invoice status:", error);
    toast.error("حدث خطأ أثناء التحقق من حالة الفاتورة");
    return null;
  }
};
