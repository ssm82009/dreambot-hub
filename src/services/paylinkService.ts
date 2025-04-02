
import { toast } from "sonner";

// تكوين PayLink - تحديث عنوان API ليكون صحيحاً بناءً على وثائق المطور
const PAYLINK_API_URL = 'https://api.paylink.sa/v2';
const PAYLINK_REDIRECT_URL = window.location.origin + '/payment/success';
const PAYLINK_REDIRECT_URL_CANCEL = window.location.origin + '/payment/cancel';

// واجهة للفاتورة
export interface PaylinkInvoice {
  id: string;
  status: string;
  payment_url: string;
  client_info: {
    client_name: string;
    client_email: string;
    client_mobile: string;
  };
  products: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  amount: number;
  currency_code: string;
}

// إنشاء فاتورة PayLink جديدة
export const createPaylinkInvoice = async (
  apiKey: string,
  amount: number,
  planName: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string
): Promise<PaylinkInvoice | null> => {
  try {
    // تسجيل بيانات الطلب للتشخيص
    console.log("Creating PayLink invoice with data:", {
      planName,
      amount,
      customerName,
      customerEmail,
      customerPhone
    });

    // إعداد الطلب مع بيانات العميل والمنتج
    const requestData = {
      amount: amount,
      callback_url: PAYLINK_REDIRECT_URL,
      cancel_url: PAYLINK_REDIRECT_URL_CANCEL,
      client_info: {
        name: customerName,
        email: customerEmail,
        mobile: customerPhone
      },
      products: [
        {
          title: `اشتراك في باقة ${planName}`,
          price: amount,
          qty: 1
        }
      ],
      currency_code: "SAR"
    };

    console.log("Request data:", JSON.stringify(requestData));

    // إرسال طلب لإنشاء فاتورة جديدة
    const response = await fetch(`${PAYLINK_API_URL}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // التحقق من استجابة الخادم
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
    
    // التحقق من البيانات المُستلمة من PayLink
    if (!data.id || !data.payment_url) {
      throw new Error("استجابة PayLink غير صالحة");
    }

    return data as PaylinkInvoice;
  } catch (error) {
    console.error("Error creating PayLink invoice:", error);
    toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء فاتورة الدفع");
    return null;
  }
};

// الاستعلام عن حالة الفاتورة
export const getPaylinkInvoiceStatus = async (apiKey: string, invoiceId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${PAYLINK_API_URL}/invoice/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`فشل في الاستعلام عن حالة الفاتورة: ${response.status}`);
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error checking invoice status:", error);
    toast.error("حدث خطأ أثناء التحقق من حالة الفاتورة");
    return null;
  }
};
