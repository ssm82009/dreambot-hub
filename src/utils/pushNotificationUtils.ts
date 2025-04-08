
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
export const PUBLIC_VAPID_KEY = 'BLBz5HW9GU26px7aSGgqZR9xoA7Sj5Q8q0c7_KMgPgTcgccR9EkTuZAs5TmGpJ9liMPHvw4-l7-Ftm1Qz-5qvEs';
