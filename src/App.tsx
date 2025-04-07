
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './App.css';

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

// Setup query client
const queryClient = new QueryClient();

// Admin routing with meta tags support
const AdminRoutes = () => {
  usePageMeta();
  return <Admin />;
};

// Main App component
const App = () => {
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
  
  return (
    <div className="page-container">
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
    </div>
  );
};

export default App;
