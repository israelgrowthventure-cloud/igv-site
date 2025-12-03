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
    // Load language from localStorage or browser
    const savedLang = localStorage.getItem('igv_language');
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (['fr', 'en', 'he'].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('igv_language', lang);
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

