import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import './i18n/config';
import './App.css';

// Context Providers
import { GeoProvider } from './context/GeoContext';
import { AuthProvider } from './context/AuthContext';

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
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Admin Pages
import Login from './pages/admin/Login';
import CMSDashboard from './pages/admin/CMSDashboard';
import CMSEditor from './pages/admin/CMSEditor';

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
      <GeoProvider>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <BrowserRouter>
              <div className="App">
                <Toaster position="top-right" richColors />
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/packs" element={<Packs />} />
                    <Route path="/future-commerce" element={<Future Commerce />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/appointment" element={<Appointment />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Payment Routes */}
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failure" element={<PaymentFailure />} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/cms" element={<CMSDashboard />} />
                    <Route path="/admin/cms/editor/:page_slug/:language" element={<CMSEditor />} />

                    {/* Fallback */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </Suspense>
        </AuthProvider>
      </GeoProvider>
    </HelmetProvider>
  );
}

export default App;
