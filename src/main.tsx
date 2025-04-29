
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { OneSignalService } from './services/oneSignalService.ts'

// تهيئة OneSignal على مستوى التطبيق
async function initApp() {
  // انتظار تحميل OneSignal
  if (typeof window !== 'undefined' && window.OneSignalDeferred) {
    console.log('تجهيز OneSignal...');
  }
  
  // تحميل التطبيق
  createRoot(document.getElementById("root")!).render(<App />);
}

initApp();
