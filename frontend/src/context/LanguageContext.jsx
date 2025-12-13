import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    // 1. Check URL params first (SEO / Direct link)
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');

    if (langParam && ['fr', 'en', 'he'].includes(langParam)) {
      setLanguage(langParam);
      localStorage.setItem('igv_language', langParam);
      return;
    }

    // 2. Load language from localStorage
    const savedLang = localStorage.getItem('igv_language');
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // 3. Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['fr', 'en', 'he'].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('igv_language', lang);
    // Optional: Update URL to reflect language without reload? 
    // Maybe too invasive for now, let's keep it simple.
  };

  const t = (key, lang = language) => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, setTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};
