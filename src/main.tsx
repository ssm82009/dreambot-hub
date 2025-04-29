
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// حذفنا تهيئة OneSignal من هنا لأنه يتم استدعاؤه في HTML ويتم التعامل معه في useNotifications

// تحميل التطبيق
createRoot(document.getElementById("root")!).render(<App />);
