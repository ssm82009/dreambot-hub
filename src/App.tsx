
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import DreamDetails from './pages/DreamDetails';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import NewTicket from './pages/NewTicket';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Context Providers
import { AdminProvider } from './contexts/admin/AdminProvider';
import { usePageMeta } from './hooks/usePageMeta';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useServiceWorkerRegistration } from './hooks/useServiceWorkerRegistration';
import { useEffect } from 'react';
import { initializeServices } from './services/initializeServices';

// Setup query client
const queryClient = new QueryClient();

// Admin routing with meta tags support
const AdminRoutes = () => {
  usePageMeta();
  useScrollToTop();
  return <Admin />;
};

// Main App component
const App = () => {
  // إعداد Firebase وتهيئة قاعدة البيانات عند بدء التطبيق
  useEffect(() => {
    // Launch service initialization without blocking the app render
    initializeServices()
      .then(results => {
        console.log("App services initialization completed:", results);
      })
      .catch(error => {
        // This should never happen due to internal error handling in initializeServices
        console.error("Unexpected error during service initialization:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster position="top-center" dir="rtl" />
        </BrowserRouter>
      </AdminProvider>
    </QueryClientProvider>
  );
};

// Separated for using usePageMeta hook which requires Router context
const AppContent = () => {
  usePageMeta();
  useScrollToTop();
  useServiceWorkerRegistration();  // تسجيل خدمة العامل عند تحميل التطبيق
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dream/:id" element={<DreamDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminRoutes />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/tickets/:id" element={<TicketDetails />} />
      <Route path="/tickets/new" element={<NewTicket />} />
      <Route path="/about" element={<About />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
