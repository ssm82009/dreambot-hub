
import { toast } from "sonner";

// تكوين PayLink - دعم بيئتي الاختبار والإنتاج بناءً على توثيق API الصحيح
const PAYLINK_API_BASE = {
  test: 'https://restpilot.paylink.sa',
  production: 'https://restapi.paylink.sa'
};

// مسارات API المختلفة بناءً على الكود PHP
const API_PATHS = {
  auth: '/api/auth',
  invoice: '/api/addInvoice',
  getInvoice: '/api/getInvoice'
};

const PAYLINK_REDIRECT_URL = window.location.origin + '/payment/success';
const PAYLINK_REDIRECT_URL_CANCEL = window.location.origin + '/payment/cancel';

// واجهة للفاتورة
export interface PaylinkInvoice {
  id?: string;
  status?: string;
  payment_url?: string;
  url?: string;  // PayLink يمكن أن يستخدم 'url' بدلاً من 'payment_url'
  client_info?: {
    client_name: string;
    client_email: string;
    client_mobile: string;
  };
  products?: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  amount: number;
  currency_code: string;
  orderNumber?: string;
  transactionNo?: string;
  orderStatus?: string;
}

// الحصول على رمز المصادقة من PayLink
const getAuthToken = async (apiKey: string, secretKey: string): Promise<string | null> => {
  try {
    // تحديد البيئة المناسبة بناءً على مفتاح API
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    const apiBase = isTestMode ? PAYLINK_API_BASE.test : PAYLINK_API_BASE.production;
    
    console.log(`Getting PayLink auth token in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Auth URL: ${apiBase}${API_PATHS.auth}`);

    // بناء بيانات المصادقة كما في الكود PHP
    const authData = {
      apiId: apiKey,
      secretKey: secretKey,
      persistToken: false
    };

    console.log("Auth request data:", JSON.stringify(authData));

    // إرسال طلب المصادقة
    const response = await fetch(`${apiBase}${API_PATHS.auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authData)
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (jsonError) {
        errorText = await response.text();
      }
      
      console.error("PayLink Auth API error:", errorText);
      throw new Error(`فشل في المصادقة مع PayLink: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PayLink auth response:", data);
    
    // التحقق من وجود رمز المصادقة
    if (!data.id_token) {
      throw new Error("لم يتم الحصول على رمز المصادقة من PayLink");
    }

    return data.id_token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء المصادقة مع مزود الدفع");
    return null;
  }
};

// إنشاء فاتورة PayLink جديدة
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
    // الحصول على رمز المصادقة أولاً
    const authToken = await getAuthToken(apiKey, secretKey);
    if (!authToken) {
      throw new Error("فشل في الحصول على رمز المصادقة");
    }

    // تحديد البيئة المناسبة بناءً على مفتاح API
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    const apiBase = isTestMode ? PAYLINK_API_BASE.test : PAYLINK_API_BASE.production;
    
    console.log(`Using PayLink in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Invoice URL: ${apiBase}${API_PATHS.invoice}`);

    // إنشاء رقم طلب فريد
    const orderNumber = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // تسجيل بيانات الطلب للتشخيص
    console.log("Creating PayLink invoice with data:", {
      planName,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      orderNumber
    });

    // إعداد الطلب مع بيانات العميل والمنتج كما في الكود PHP
    const requestData = {
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

    // إرسال طلب لإنشاء فاتورة جديدة
    const response = await fetch(`${apiBase}${API_PATHS.invoice}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
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
    if (!data.url) {
      throw new Error("استجابة PayLink غير صالحة - لم يتم العثور على رابط الدفع");
    }

    // تحويل الاستجابة إلى صيغة موحدة
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

// الاستعلام عن حالة الفاتورة
export const getPaylinkInvoiceStatus = async (
  apiKey: string, 
  secretKey: string,
  transactionNo: string
): Promise<string | null> => {
  try {
    // الحصول على رمز المصادقة أولاً
    const authToken = await getAuthToken(apiKey, secretKey);
    if (!authToken) {
      throw new Error("فشل في الحصول على رمز المصادقة");
    }

    // تحديد البيئة المناسبة بناءً على مفتاح API
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    const apiBase = isTestMode ? PAYLINK_API_BASE.test : PAYLINK_API_BASE.production;
    
    console.log(`Getting invoice status in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Get Invoice URL: ${apiBase}${API_PATHS.getInvoice}/${transactionNo}`);

    // إرسال طلب للحصول على حالة الفاتورة
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
    
    // إرجاع حالة الطلب
    return data.orderStatus || null;
  } catch (error) {
    console.error("Error checking invoice status:", error);
    toast.error("حدث خطأ أثناء التحقق من حالة الفاتورة");
    return null;
  }
};
