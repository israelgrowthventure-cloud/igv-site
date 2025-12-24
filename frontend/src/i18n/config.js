import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';
import he from './locales/he.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      he: { translation: he }
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'he'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Update HTML lang and dir attributes on language change
i18n.on('languageChanged', (lng) => {
  const html = document.documentElement;
  html.setAttribute('lang', lng);
  html.setAttribute('dir', lng === 'he' ? 'rtl' : 'ltr');
});

// Set initial lang and dir
const currentLang = i18n.language || 'fr';
document.documentElement.setAttribute('lang', currentLang);
document.documentElement.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');

export default i18n;
