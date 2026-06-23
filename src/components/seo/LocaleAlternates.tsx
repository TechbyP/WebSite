import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { buildLocalizedUrl, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../../utils/seo';

const INDEXABLE_PATH_PATTERNS = [
  /^\/$/,
  /^\/contact$/,
  /^\/downloads$/,
  /^\/privacy$/,
  /^\/terms$/,
  /^\/imprint$/,
  /^\/configurator$/,
  /^\/blog$/,
  /^\/blog\/[^/]+$/,
  /^\/product\/[^/]+$/,
];

const isIndexablePath = (pathname: string) => {
  return INDEXABLE_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
};

export default function LocaleAlternates() {
  const location = useLocation();

  if (!isIndexablePath(location.pathname)) {
    return null;
  }

  return (
    <Helmet>
      {SUPPORTED_LOCALES.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={buildLocalizedUrl(location.pathname, locale)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={buildLocalizedUrl(location.pathname, DEFAULT_LOCALE)}
      />
    </Helmet>
  );
}
