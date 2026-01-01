import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';
import './styles/rtl.css';

// Build trigger: 2025-12-30-performance-v1

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivateRoute from './components/PrivateRoute';

// Pages - Loaded immediately (public facing)
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
import PaymentReturn from './pages/PaymentReturn';
import Payment from './pages/Payment';

// Admin Pages - Lazy loaded for performance (code splitting)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCRMComplete = lazy(() => import('./pages/admin/AdminCRMComplete'));
const LeadDetail = lazy(() => import('./pages/admin/LeadDetail'));
const ContactDetail = lazy(() => import('./pages/admin/ContactDetail'));
const Pipeline = lazy(() => import('./pages/admin/Pipeline'));
const AdminInvoices = lazy(() => import('./pages/AdminInvoices'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminTasks = lazy(() => import('./pages/AdminTasks'));

// Preload admin components on hover/focus for instant navigation
export const preloadAdminComponents = () => {
  import('./pages/admin/AdminCRMComplete');
  import('./pages/admin/LeadDetail');
  import('./pages/admin/ContactDetail');
  import('./pages/admin/Pipeline');
  import('./pages/admin/Dashboard');
};

// 404 Page with i18n
const NotFoundPage = () => {
  const { t } = require('react-i18next').useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-4">{t('errors.pageNotFound', 'Page non trouvée')}</p>
        <a href="/" className="text-blue-600 hover:underline">{t('common.backToHome', 'Retour à l\'accueil')}</a>
      </div>
    </div>
  );
};

// Loading component - Ultra fast skeleton for lazy loaded routes
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

// Admin-specific loading with skeleton
const AdminLoading = () => (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Preload admin components when entering admin area
  React.useEffect(() => {
    if (isAdminRoute) {
      preloadAdminComponents();
    }
  }, [isAdminRoute]);

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
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/return" element={<PaymentReturn />} />
          <Route path="/payment-success" element={<PaymentReturn />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={
            <Suspense fallback={<Loading />}><AdminLogin /></Suspense>
          } />
          <Route path="/admin/dashboard" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminDashboard /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/dashboard" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/leads" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/opportunities" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/contacts" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/settings" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/pipeline" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminCRMComplete /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/leads/:id" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><LeadDetail /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/crm/contacts/:id" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><ContactDetail /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/invoices" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminInvoices /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/payments" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminPayments /></Suspense></PrivateRoute>
          } />
          <Route path="/admin/tasks" element={
            <PrivateRoute><Suspense fallback={<AdminLoading />}><AdminTasks /></Suspense></PrivateRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
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
