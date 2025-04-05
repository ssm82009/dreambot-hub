
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';
import DreamDetails from './pages/DreamDetails';
import Admin from './pages/Admin';
import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import NewTicket from './pages/NewTicket';
import SeoManager from './components/SeoManager';

import './App.css';

function App() {
  return (
    <Router>
      <SeoManager />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dream/:id" element={<DreamDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
        <Route path="/tickets/new" element={<NewTicket />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
