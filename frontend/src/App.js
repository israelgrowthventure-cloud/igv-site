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
 * CRITICAL ARCHITECTURE CHANGE:
 * ==============================
 * This application is now 100% controlled by the visual CMS.
 * 
 * ALL pages (home, packs, about, contact, etc) are now dynamic and come from the CMS.
 * The only exception is the /admin route which is kept for administrative purposes.
 * 
 * HOW IT WORKS:
 * - Every route (/, /packs, /about, etc) goes through <CmsPage />
 * - CmsPage fetches content from the CMS API based on the URL slug
 * - The CMS returns blocks (heading, text, image, button, etc)
 * - CmsPageRenderer renders these blocks into React components
 * 
 * TO CHANGE ANY PAGE:
 * 1. Go to the CMS admin interface (separate application)
 * 2. Edit or create pages with the visual editor
 * 3. Publish changes
 * 4. Pages are immediately live - NO CODE DEPLOYMENT NEEDED
 * 
 * TO ADD NEW PAGES:
 * - Simply create a new page in the CMS with the desired slug
 * - It will be automatically accessible at /{slug}
 * - NO changes to this routing file required
 */

// CMS-powered universal page loader
import CmsPage from './pages/CmsPage';

// Keep admin pages for internal management
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
          {/* Admin routes - kept separate from CMS */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/editor" element={<ContentEditor />} />
          <Route path="/simple-admin" element={<SimpleAdmin />} />
          
          {/* ALL OTHER ROUTES: Powered by CMS */}
          {/* This includes: /, /packs, /about, /contact, /terms, and ANY future pages */}
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
