export const SITE_URL = 'https://www.techbyp.com';

export const SUPPORTED_LOCALES = ['en', 'de', 'es', 'fr', 'pt', 'ro', 'ru'] as const;
export const DEFAULT_LOCALE = 'en';

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const buildCanonicalUrl = (pathname: string) => {
  if (!pathname) {
    return SITE_URL;
  }

  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
};

export const buildLocalizedUrl = (pathname: string, locale: SupportedLocale) => {
  const url = new URL(buildCanonicalUrl(pathname));

  if (locale === DEFAULT_LOCALE) {
    url.searchParams.delete('lng');
  } else {
    url.searchParams.set('lng', locale);
  }

  return url.toString();
};

export const toAbsoluteUrl = (url: string) => {
  if (!url) {
    return SITE_URL;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return buildCanonicalUrl(url);
};

export const normalizeResourceId = (rawId: string | undefined) => {
  const trimmed = rawId?.trim() ?? '';

  if (!trimmed) {
    return '';
  }

  const trailingNumericId = trimmed.match(/(\d+)$/)?.[1];

  return trailingNumericId ?? trimmed;
};