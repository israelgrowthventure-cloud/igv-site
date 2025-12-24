import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, X, Settings } from 'lucide-react';

/**
 * MISSION D: Cookie Consent Banner
 * Displays cookie consent options and saves user preferences
 * Supports: Essential, Analytics, Marketing cookies
 */
const CookieConsent = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,  // Always true, required
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentData = localStorage.getItem('igv-cookie-consent');
    
    if (!consentData) {
      // Show banner after 2 seconds delay
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consentData);
        setPreferences(saved.preferences || preferences);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const saveConsent = (prefs) => {
    const consentData = {
      preferences: prefs,
      date: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem('igv-cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
    setShowSettings(false);

    // Dispatch custom event for analytics tracking
    window.dispatchEvent(new CustomEvent('igv-consent-updated', { 
      detail: { preferences: prefs } 
    }));
  };

  const handleAcceptAll = () => {
    const allPrefs = {
      essential: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allPrefs);
    saveConsent(allPrefs);
  };

  const handleRejectAll = () => {
    const minimalPrefs = {
      essential: true,
      analytics: false,
      marketing: false
    };
    setPreferences(minimalPrefs);
    saveConsent(minimalPrefs);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  const translations = {
    fr: {
      title: "🍪 Nous utilisons des cookies",
      description: "Nous utilisons des cookies essentiels pour le fonctionnement du site, et des cookies analytiques pour améliorer votre expérience. Vous pouvez personnaliser vos préférences.",
      acceptAll: "Accepter tout",
      rejectAll: "Refuser",
      customize: "Personnaliser",
      save: "Enregistrer",
      essential: "Cookies essentiels",
      essentialDesc: "Nécessaires au fonctionnement du site (toujours activés)",
      analytics: "Cookies analytiques",
      analyticsDesc: "Nous aident à comprendre comment vous utilisez le site",
      marketing: "Cookies marketing",
      marketingDesc: "Utilisés pour afficher des publicités pertinentes"
    },
    en: {
      title: "🍪 We use cookies",
      description: "We use essential cookies for site functionality and analytics cookies to improve your experience. You can customize your preferences.",
      acceptAll: "Accept all",
      rejectAll: "Reject",
      customize: "Customize",
      save: "Save",
      essential: "Essential cookies",
      essentialDesc: "Required for site functionality (always enabled)",
      analytics: "Analytics cookies",
      analyticsDesc: "Help us understand how you use the site",
      marketing: "Marketing cookies",
      marketingDesc: "Used to show relevant advertisements"
    },
    he: {
      title: "🍪 אנו משתמשים בעוגיות",
      description: "אנו משתמשים בעוגיות חיוניות לתפקוד האתר, ובעוגיות אנליטיות לשיפור החוויה שלך. ניתן להתאים את ההעדפות שלך.",
      acceptAll: "קבל הכל",
      rejectAll: "דחה",
      customize: "התאמה אישית",
      save: "שמור",
      essential: "עוגיות חיוניות",
      essentialDesc: "נדרשות לתפקוד האתר (תמיד מופעלות)",
      analytics: "עוגיות אנליטיות",
      analyticsDesc: "עוזרות לנו להבין כיצד אתם משתמשים באתר",
      marketing: "עוגיות שיווקיות",
      marketingDesc: "משמשות להצגת פרסומות רלוונטיות"
    }
  };

  const txt = translations[currentLang] || translations.en;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200">
        {/* Settings Panel */}
        {showSettings ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{txt.customize}</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{txt.essential}</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {currentLang === 'fr' ? 'Requis' : currentLang === 'he' ? 'נדרש' : 'Required'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{txt.essentialDesc}</p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 rounded text-green-600"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{txt.analytics}</h4>
                  <p className="text-sm text-gray-600">{txt.analyticsDesc}</p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{txt.marketing}</h4>
                  <p className="text-sm text-gray-600">{txt.marketingDesc}</p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveCustom}
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              {txt.save}
            </button>
          </div>
        ) : (
          /* Main Banner */
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{txt.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{txt.description}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
              >
                {txt.acceptAll}
              </button>
              <button
                onClick={handleCustomize}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all"
              >
                {txt.customize}
              </button>
              <button
                onClick={handleRejectAll}
                className="py-3 px-6 text-gray-600 font-medium hover:text-gray-800 transition-all"
              >
                {txt.rejectAll}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
