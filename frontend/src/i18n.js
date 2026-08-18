import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Define supported languages
const supportedLngs = ['en', 'ps', 'dr'];

export const i18nPromise = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: supportedLngs,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
    parseMissingKeyHandler: (key) => {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    },
  });

// Handle language code normalization
i18n.on('languageChanged', (lng) => {
  const normalizedLng = lng.split('-')[0];
  if (normalizedLng !== lng && supportedLngs.includes(normalizedLng)) {
    i18n.changeLanguage(normalizedLng);
  }
});

export default i18n;