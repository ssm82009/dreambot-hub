
// PayLink service types

// Interface for PayLink invoice
export interface PaylinkInvoice {
  id?: string;
  status?: string;
  payment_url?: string;
  url?: string;  // PayLink can use 'url' instead of 'payment_url'
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

// Interface for authentication data
export interface AuthData {
  apiId: string;
  secretKey: string;
  persistToken: boolean;
}

// Interface for PayLink invoice request data
export interface InvoiceRequestData {
  orderNumber: string;
  amount: number;
  callBackUrl: string;
  cancelUrl: string;
  clientName: string;
  clientEmail: string;
  clientMobile: string;
  currency: string;
  products: Array<{
    title: string;
    price: number;
    qty: number;
  }>;
}
