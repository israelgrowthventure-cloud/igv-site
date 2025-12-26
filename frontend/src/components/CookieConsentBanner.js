import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';

const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState({
    consent_analytics: false,
    consent_marketing: false
  });

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = () => {
    // Check localStorage ONLY - instant display
    const localConsent = localStorage.getItem('cookie_consent');
    if (!localConsent) {
      setShow(true);
    }
  };

  const handleAcceptAll = async () => {
    const prefs = { consent_analytics: true, consent_marketing: true };
    // Close immediately
    setShow(false);
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    // Save to backend in background
    try {
      await api.post('/api/gdpr/consent', prefs);
    } catch (error) {
      console.error('Failed to save consent to backend:', error);
    }
  };

  const handleRefuseAll = async () => {
    const prefs = { consent_analytics: false, consent_marketing: false };
    // Close immediately
    setShow(false);
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    // Save to backend in background
    try {
      await api.post('/api/gdpr/consent', prefs);
    } catch (error) {
      console.error('Failed to save consent to backend:', error);
    }
  };

  const handleSavePreferences = async () => {
    // Close immediately
    setShow(false);
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    // Save to backend in background
    try {
      await api.post('/api/gdpr/consent', preferences);
    } catch (error) {
      console.error('Failed to save consent to backend:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-3 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-700 flex-1">
            {t('gdpr.cookie_banner.description') || 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez choisir les types de cookies que vous acceptez.'}
          </p>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium whitespace-nowrap"
            >
              {t('gdpr.cookie_banner.accept_all') || 'Tout accepter'}
            </button>
            <button
              onClick={handleRefuseAll}
              className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 whitespace-nowrap"
            >
              {t('gdpr.cookie_banner.refuse_all') || 'Refuser'}
            </button>
            <a href="/privacy" className="px-3 py-2 text-blue-600 text-sm hover:underline whitespace-nowrap">
              {t('gdpr.cookie_banner.learn_more') || 'Plus d\'infos'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
