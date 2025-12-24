import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';

// Build trigger: 2025-12-14-11h05

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import NewHome from './pages/NewHome';  // NOUVELLE landing page
import Home from './pages/Home';  // Ancienne home (conservée en arrière-plan)
import About from './pages/About';
import Packs from './pages/Packs';
import FutureCommerce from './pages/FutureCommerce';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import Terms from './pages/Terms';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';

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
            <Header />
            <main>
              <Routes>
                {/* Homepage complète */}
                <Route path="/" element={<Home />} />
                
                {/* Mini-Analyse (accessible via menu + Home CTA) */}
                <Route path="/mini-analyse" element={<NewHome />} />
                
                {/* Pages essentielles ACTIVES */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/legal" element={<Terms />} />
                
                {/* Anciennes pages CONSERVÉES mais NON INDEXÉES (accès direct uniquement) */}
                <Route path="/packs" element={<Packs />} />
                <Route path="/future-commerce" element={<FutureCommerce />} />
                <Route path="/appointment" element={<Appointment />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/old-home" element={<Home />} />  {/* Ancienne home accessible via URL directe */}
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </Suspense>
    </HelmetProvider>
  );
}

export default App;
