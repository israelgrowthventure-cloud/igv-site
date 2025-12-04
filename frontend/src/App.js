import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { GeoProvider } from './context/GeoContext';
import { LanguageProvider } from './context/LanguageContext';
import './i18n/config';
import './App.css';

// Build metadata for deployment tracking
window.__IGV_BUILD_VERSION__ = '0.1.4';
window.__IGV_BUILD_DATE__ = '2025-12-02T16:42:00Z';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

/**
 * CRITICAL ARCHITECTURE: HYBRID ROUTING WITH CMS ENABLED
 * =======================================================
 * This application uses a hybrid routing approach with CMS fully activated:
 * 
 * 1. TECHNICAL/PAYMENT ROUTES (React Components - NOT CMS):
 *    - /checkout/:packId - Stripe payment processing
 *    - /appointment - Calendar booking
 *    - /editor - Protected drag & drop editor (Emergent Builder)
 * 
 * 2. CONTENT/MARKETING ROUTES (CMS-Driven):
 *    - / (home)
 *    - /packs
 *    - /about
 *    - /contact
 *    - /future-commerce
 *    - /terms
 *    - Any future landing/content pages
 * 
 * CMS Backend: https://igv-cms-backend.onrender.com
 * Editor Access: Protected by VITE_EDITOR_ACCESS_CODE
 */

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Packs from './pages/Packs';
import Contact from './pages/Contact';
import FutureCommercePage from './pages/FutureCommercePage';
import DynamicPage from './pages/DynamicPage';
import Checkout from './pages/Checkout';
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';

// CMS Emergent Admin pages
import LoginPage from './pages/admin/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import PagesList from './pages/admin/PagesList';
import PageEditor from './pages/admin/PageEditor';
import PacksAdmin from './pages/admin/PacksAdmin';
import PricingAdmin from './pages/admin/PricingAdmin';
import TranslationsAdmin from './pages/admin/TranslationsAdmin';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

// Wrapper pour layout conditionnel
function AppLayout() {
  const location = useLocation();
  // Admin pages et editor gèrent leur propre layout
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {!isAdminPage && <Header />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/le-commerce-de-demain" element={<FutureCommercePage />} />
          <Route path="/future-commerce" element={<FutureCommercePage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
          
          {/* Technical routes */}
          <Route path="/checkout/:packId" element={<Checkout />} />
          <Route path="/appointment" element={<Appointment />} />
          
          {/* CMS Emergent Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/pages" element={<PagesList />} />
          <Route path="/admin/pages/new" element={<PageEditor />} />
          <Route path="/admin/pages/:slug" element={<PageEditor />} />
          <Route path="/admin/packs" element={<PacksAdmin />} />
          <Route path="/admin/pricing" element={<PricingAdmin />} />
          <Route path="/admin/translations" element={<TranslationsAdmin />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <GeoProvider>
          <Suspense fallback={<Loading />}>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </Suspense>
        </GeoProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
