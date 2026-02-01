import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';

// Detect language from localStorage or browser
const getInitialLanguage = (): string => {
  // 1. Check localStorage
  const stored = localStorage.getItem('i18n_language');
  if (stored && ['en', 'fr', 'ar'].includes(stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'fr', 'ar'].includes(browserLang)) {
    return browserLang;
  }

  // 3. Default to English
  return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
      ar: { translation: arTranslations }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already handles XSS
    },
    react: {
      useSuspense: false // Disable suspense to avoid loading issues
    }
  });

// Save language preference whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18n_language', lng);
  // Update HTML lang attribute and dir for RTL languages
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

// Set initial language attributes
document.documentElement.lang = initialLanguage;
document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';

export default i18n;
