import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';
import './styles/rtl.css';

// Build trigger: 2025-12-26-routing-fix-v2

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivateRoute from './components/PrivateRoute';

// Pages
import NewHome from './pages/NewHome';  // NOUVELLE landing page
import Home from './pages/Home';  // Ancienne home (conservée en arrière-plan)
import MiniAnalysis from './pages/MiniAnalysis'; // New i18n mini-analysis page
import About from './pages/About';
import Packs from './pages/Packs';
import FutureCommerce from './pages/FutureCommerce';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCRMComplete from './pages/admin/AdminCRMComplete';
import LeadDetail from './pages/admin/LeadDetail';
import ContactDetail from './pages/admin/ContactDetail';
import Pipeline from './pages/admin/Pipeline';
import AdminInvoices from './pages/AdminInvoices';
import AdminPayments from './pages/AdminPayments';
import AdminTasks from './pages/AdminTasks';
import PaymentReturn from './pages/PaymentReturn';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <CookieConsentBanner />
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mini-analyse" element={<MiniAnalysis />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Terms />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiesPolicy />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/future-commerce" element={<FutureCommerce />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route path="/admin" element={<Navigate to="/admin/crm" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/crm" element={<PrivateRoute><AdminCRMComplete /></PrivateRoute>} />
          <Route path="/admin/crm/pipeline" element={<PrivateRoute><Pipeline /></PrivateRoute>} />
          <Route path="/admin/crm/leads/:id" element={<PrivateRoute><LeadDetail /></PrivateRoute>} />
          <Route path="/admin/crm/contacts/:id" element={<PrivateRoute><ContactDetail /></PrivateRoute>} />
          <Route path="/admin/invoices" element={<PrivateRoute><AdminInvoices /></PrivateRoute>} />
          <Route path="/admin/payments" element={<PrivateRoute><AdminPayments /></PrivateRoute>} />
          <Route path="/admin/tasks" element={<PrivateRoute><AdminTasks /></PrivateRoute>} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page non trouvée</p>
                <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<Loading />}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
