
/**
 * تحويل المفتاح العام من Base64 إلى صفيف Uint8Array
 * @param base64String المفتاح بصيغة Base64
 * @returns صفيف Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// المفتاح العام VAPID
export const PUBLIC_VAPID_KEY = 'BBy5W3xt8ZH4MIpLelj9GvzKu6Cc5DYdQRFrNsYL4m_p9lEO-K1GHL4ZnvcWe89MzB_U9CJ8Xm9QtbtC0lOG0LA';
