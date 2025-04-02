
// PayLink API configuration

// API base URLs for different environments
export const PAYLINK_API_BASE = {
  test: 'https://restpilot.paylink.sa',
  production: 'https://restapi.paylink.sa'
};

// API endpoint paths
export const API_PATHS = {
  auth: '/api/auth',
  invoice: '/api/addInvoice',
  getInvoice: '/api/getInvoice'
};

// Redirect URLs for payment outcomes
export const PAYLINK_REDIRECT_URL = window.location.origin + '/payment/success';
export const PAYLINK_REDIRECT_URL_CANCEL = window.location.origin + '/payment/cancel';

// Helper to determine if we're in test mode based on API key
export const isTestMode = (apiKey: string): boolean => {
  return apiKey.toLowerCase().startsWith('test_');
};

// Get the appropriate API base URL based on the API key
export const getApiBaseUrl = (apiKey: string): string => {
  return isTestMode(apiKey) ? PAYLINK_API_BASE.test : PAYLINK_API_BASE.production;
};
