import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Packs from './pages/Packs';
import FutureCommerce from './pages/FutureCommerce';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';
import Admin from './pages/Admin';
import ContentEditor from './pages/ContentEditor';

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
  const isAdminPage = location.pathname === '/admin' || location.pathname === '/editor' || location.pathname.startsWith('/admin/');

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {!isAdminPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/packs" element={<Packs />} />
          <Route path="/checkout/:packId" element={<Checkout />} />
          <Route path="/future-commerce" element={<FutureCommerce />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/editor" element={<ContentEditor />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<Loading />}>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
