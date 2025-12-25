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

  const checkConsent = async () => {
    try {
      const response = await api.get('/api/gdpr/consent');
      if (!response.consent_given) {
        setShow(true);
      }
    } catch (error) {
      setShow(true);
    }
  };

  const handleAcceptAll = async () => {
    const prefs = { consent_analytics: true, consent_marketing: true };
    await saveConsent(prefs);
  };

  const handleRefuseAll = async () => {
    const prefs = { consent_analytics: false, consent_marketing: false };
    await saveConsent(prefs);
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
  };

  const saveConsent = async (prefs) => {
    try {
      await api.post('/api/gdpr/consent', prefs);
      setShow(false);
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-2xl z-50 p-6 max-h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{t('gdpr.cookie_banner.title') || 'Gestion des cookies'}</h3>
          <button onClick={handleRefuseAll} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-700 mb-6">
          {t('gdpr.cookie_banner.description') || 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez choisir les types de cookies que vous acceptez.'}
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="mt-1 w-5 h-5"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{t('gdpr.cookie_banner.essential') || 'Cookies essentiels'}</h4>
              <p className="text-sm text-gray-600">
                {t('gdpr.cookie_banner.essential_desc') || 'Nécessaires au fonctionnement du site. Toujours activés.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              checked={preferences.consent_analytics}
              onChange={(e) => setPreferences({ ...preferences, consent_analytics: e.target.checked })}
              className="mt-1 w-5 h-5"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{t('gdpr.cookie_banner.analytics') || 'Cookies analytiques'}</h4>
              <p className="text-sm text-gray-600">
                {t('gdpr.cookie_banner.analytics_desc') || 'Nous permettent de comprendre comment les visiteurs utilisent notre site.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              checked={preferences.consent_marketing}
              onChange={(e) => setPreferences({ ...preferences, consent_marketing: e.target.checked })}
              className="mt-1 w-5 h-5"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{t('gdpr.cookie_banner.marketing') || 'Cookies marketing'}</h4>
              <p className="text-sm text-gray-600">
                {t('gdpr.cookie_banner.marketing_desc') || 'Utilisés pour vous envoyer des communications personnalisées.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAcceptAll}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {t('gdpr.cookie_banner.accept_all') || 'Tout accepter'}
          </button>
          <button
            onClick={handleSavePreferences}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            {t('gdpr.cookie_banner.save_preferences') || 'Enregistrer mes préférences'}
          </button>
          <button
            onClick={handleRefuseAll}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('gdpr.cookie_banner.refuse_all') || 'Tout refuser'}
          </button>
          <a href="/privacy" className="px-6 py-3 text-blue-600 hover:underline inline-flex items-center">
            {t('gdpr.cookie_banner.learn_more') || 'En savoir plus'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
