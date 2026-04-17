import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ro from './locales/ro.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector) // Detects language from browser or localStorage
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      es: { translation: es },
      fr: { translation: fr },
      ro: { translation: ro },
      pt: { translation: pt },
      ru: { translation: ru },
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'], // Language detection priority
      caches: ['localStorage'],
    },
  });

export default i18n;
