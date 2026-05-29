import i18n, { type BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const localeLoaders = {
  en: () => import('./locales/en.json'),
  de: () => import('./locales/de.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  ro: () => import('./locales/ro.json'),
  pt: () => import('./locales/pt.json'),
  ru: () => import('./locales/ru.json'),
} as const;

type SupportedLocale = keyof typeof localeLoaders;

const localeBackend: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: (language, _namespace, callback) => {
    const normalizedLanguage = language.toLowerCase().split('-')[0] as SupportedLocale;
    const loadLocale = localeLoaders[normalizedLanguage] ?? localeLoaders.en;

    loadLocale()
      .then((module) => {
        callback(null, module.default);
      })
      .catch((error) => {
        callback(error, null);
      });
  },
};

i18n
  .use(localeBackend)
  .use(LanguageDetector) // Detects language from browser or localStorage
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // Default language
    supportedLngs: Object.keys(localeLoaders),
    load: 'languageOnly',
    ns: ['translation'],
    defaultNS: 'translation',
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'], // Language detection priority
      caches: ['localStorage'],
    },
  });

export default i18n;
