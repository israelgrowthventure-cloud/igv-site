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
 * CRITICAL ARCHITECTURE: STANDARD ROUTING (CMS DISABLED TEMPORARILY)
 * ==================================================================
 * Using standard React routing until CMS backend is deployed on Render.
 * 
 * ROUTES:
 * - All pages use React components
 * - CMS will be enabled once backend is live at igv-backend.onrender.com
 * 
 * TO ENABLE CMS AFTER BACKEND DEPLOYMENT:
 * 1. Deploy backend to Render (igv-backend service)
 * 2. Test: https://igv-backend.onrender.com/api/health
 * 3. Uncomment CmsPage routing below
 * 4. Comment out React component routes
 */

// Page Components
import Home from './pages/Home';
import Packs from './pages/Packs';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';

// Technical/functional pages
import Checkout from './pages/Checkout';
import Appointment from './pages/Appointment';

// Admin pages
import Admin from './pages/Admin';
import ContentEditor from './pages/ContentEditor';
import SimpleAdmin from './pages/SimpleAdmin';

// CMS Page (temporarily disabled until backend is deployed)
// import CmsPage from './pages/CmsPage';

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
              CONTENT PAGES (React Components)
              ======================================== */}
          
          <Route path="/" element={<Home />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* ========================================
              TECHNICAL/PAYMENT ROUTES
              ======================================== */}
          
          <Route path="/checkout/:packId" element={<Checkout />} />
          <Route path="/appointment" element={<Appointment />} />
          
          {/* ========================================
              ADMIN ROUTES
              ======================================== */}
          
          <Route path="/admin" element={<Admin />} />
          <Route path="/editor" element={<ContentEditor />} />
          <Route path="/simple-admin" element={<SimpleAdmin />} />
          
          {/* ========================================
              CMS ROUTING (DISABLED UNTIL BACKEND IS DEPLOYED)
              ======================================== */}
          
          {/* Uncomment after deploying CMS backend:
          <Route path="*" element={<CmsPage />} />
          */}
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
