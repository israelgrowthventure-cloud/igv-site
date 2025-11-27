import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { GeoProvider } from './context/GeoContext';
import './i18n/config';
import './App.css';

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
 *    - /admin, /editor, /simple-admin - Admin interfaces
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
 */

// CMS-powered universal page loader
import CmsPage from './pages/CmsPage';

// Technical/functional pages (React components with business logic)
import Checkout from './pages/Checkout';
import Appointment from './pages/Appointment';

// Admin pages
import Admin from './pages/Admin';
import ContentEditor from './pages/ContentEditor';
import SimpleAdmin from './pages/SimpleAdmin';

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
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/editor' || location.pathname === '/simple-admin' || location.pathname.startsWith('/admin/');

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {!isAdminPage && <Header />}
      <main>
        <Routes>
          {/* ========================================
              TECHNICAL/PAYMENT ROUTES (React Components)
              ======================================== */}
          
          {/* Checkout - Stripe payment processing */}
          <Route path="/checkout/:packId" element={<Checkout />} />
          
          {/* Appointment - Calendar booking */}
          <Route path="/appointment" element={<Appointment />} />
          
          {/* Admin routes - Internal management */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/editor" element={<ContentEditor />} />
          <Route path="/simple-admin" element={<SimpleAdmin />} />
          
          {/* ========================================
              CONTENT/MARKETING ROUTES (CMS-Driven)
              ======================================== */}
          
          {/* Catch-all route for CMS pages */}
          {/* Handles: /, /packs, /about, /contact, /future-commerce, /terms, etc. */}
          <Route path="*" element={<CmsPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <GeoProvider>
        <Suspense fallback={<Loading />}>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </Suspense>
      </GeoProvider>
    </HelmetProvider>
  );
}

export default App;
