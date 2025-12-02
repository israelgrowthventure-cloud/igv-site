import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { GeoProvider } from './context/GeoContext';
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

// Direct React pages (NO CMS - backend is down)
import Home from './pages/Home';
import About from './pages/About';
import Packs from './pages/Packs';
import Contact from './pages/Contact';
import FutureCommerce from './pages/FutureCommerce';
import Checkout from './pages/Checkout';
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';

// NEW: Simple Editor (JSON-based CMS)
import Editor from './pages/Editor';

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
  // L'éditeur gère son propre layout (pas de header/footer)
  const isEditorPage = location.pathname === '/editor' || location.pathname === '/content-editor';

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {!isEditorPage && <Header />}
      <main>
        <Routes>
          {/* Direct React Routes - NO CMS (backend down) */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/future-commerce" element={<FutureCommerce />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Technical routes */}
          <Route path="/checkout/:packId" element={<Checkout />} />
          <Route path="/appointment" element={<Appointment />} />
          
          {/* Simple JSON-based CMS editor */}
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </main>
      {!isEditorPage && <Footer />}
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
