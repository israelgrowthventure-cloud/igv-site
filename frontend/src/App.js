import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';
import './styles/rtl.css';

// Build trigger: 2025-12-26-production-routing-fix

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

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<Loading />}>
        <BrowserRouter>
          <div className="App">
            <Toaster position="top-right" richColors />
            <CookieConsentBanner />
            <Routes>
              {/* Admin Routes - NO LAYOUT */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/crm" element={<PrivateRoute><AdminCRMComplete /></PrivateRoute>} />
              
              {/* Public Routes - WITH LAYOUT */}
              <Route path="/*" element={
                <>
                  <Header />
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
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
