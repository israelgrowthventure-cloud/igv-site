import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/config';
import './App.css';
import './styles/rtl.css';

// Build trigger: 2026-01-12-phase1-refactor-crm-modular

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import CookieConsentBanner from './components/CookieConsentBanner';
import PrivateRoute from './components/PrivateRoute';

// Pages - Loaded immediately (public facing)
import Home from './pages/Home';  // Page d'accueil originale restaurée
import NewHome from './pages/NewHome';  // Page de mini-analyse (gardée pour référence)
import MiniAnalysis from './pages/MiniAnalysis'; // New i18n mini-analysis page
import About from './pages/About';
import Packs from './pages/Packs';
import FutureCommerce from './pages/FutureCommerce';
import Contact from './pages/Contact';
import ContactExpert from './pages/ContactExpert'; // Phase 2: High-Ticket Consulting route
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import PaymentReturn from './pages/PaymentReturn';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import DemandeRappel from './pages/DemandeRappel';
import SitemapView from './pages/SitemapView'; // SEO sitemap page

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages - Lazy loaded for performance (code splitting)
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/admin/LeadsPage'));
const ContactsPage = lazy(() => import('./pages/admin/ContactsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const LeadDetail = lazy(() => import('./pages/admin/LeadDetail'));
const ContactDetail = lazy(() => import('./pages/admin/ContactDetail'));
const Pipeline = lazy(() => import('./pages/admin/Pipeline'));
const AdminInvoices = lazy(() => import('./pages/AdminInvoices'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminTasks = lazy(() => import('./pages/AdminTasks'));
const MediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'));

// CRM Modular Pages (Phase 1 Refactor)
const OpportunitiesPage = lazy(() => import('./pages/admin/OpportunitiesPage'));
const EmailsPage = lazy(() => import('./pages/admin/EmailsPage'));
const ActivitiesPage = lazy(() => import('./pages/admin/ActivitiesPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Preload admin components on hover/focus for instant navigation
export const preloadAdminComponents = () => {
  import('./pages/admin/LeadDetail');
  import('./pages/admin/ContactDetail');
  import('./pages/admin/Pipeline');
  import('./pages/admin/Dashboard');
  import('./pages/admin/OpportunitiesPage');
  import('./pages/admin/EmailsPage');
  import('./pages/admin/ActivitiesPage');
  import('./pages/admin/SettingsPage');
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

  // DISABLED: CMS embeddable script (bulle crayon WYSIWYG)
  // Commenté pour Mission 2 - sera réactivé quand le CMS sera prêt
  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.src = 'https://4vm404m082y6.space.minimax.io/livecms.js';
  //   script.async = true;
  //   script.onload = () => console.log('✅ CMS embeddable chargé');
  //   script.onerror = () => console.warn('⚠️ CMS embeddable non disponible');
  //   document.body.appendChild(script);
  //   
  //   return () => {
  //     if (document.body.contains(script)) {
  //       document.body.removeChild(script);
  //     }
  //   };
  // }, []);

  return (
    <AuthProvider>
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
            <Route path="/demande-rappel" element={<DemandeRappel />} />
            <Route path="/sitemap-igv" element={<SitemapView />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/payment-success" element={<PaymentReturn />} />
            <Route path="/contact-expert" element={<ContactExpert />} />
            <Route path="/admin" element={<Navigate to="/admin/crm/dashboard" replace />} />
            <Route path="/admin/login" element={
              <Suspense fallback={<Loading />}><AdminLogin /></Suspense>
            } />
            
            {/* Admin CRM Routes with AdminLayout */}
            <Route path="/admin/crm" element={
              <PrivateRoute>
                <Suspense fallback={<AdminLoading />}>
                  <AdminLayout />
                </Suspense>
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/admin/crm/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="emails" element={<EmailsPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            <Route path="/admin/dashboard" element={
              <PrivateRoute><Suspense fallback={<AdminLoading />}><Navigate to="/admin/crm/dashboard" replace /></Suspense></PrivateRoute>
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
            <Route path="/admin/media" element={
              <PrivateRoute><Suspense fallback={<AdminLoading />}><MediaLibrary /></Suspense></PrivateRoute>
            } />
            <Route path="/admin/forgot-password" element={
              <Suspense fallback={<Loading />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<Loading />}>
                <ResetPassword />
              </Suspense>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
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
