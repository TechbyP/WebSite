import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LocaleAlternates from '../components/seo/LocaleAlternates';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, buildLocalizedUrl } from '../utils/seo';

describe('SEO locale alternate links', () => {
  it('builds localized URLs with lng query parameter for non-default locales', () => {
    const germanUrl = buildLocalizedUrl('/blog', 'de');
    const englishUrl = buildLocalizedUrl('/blog', 'en');

    expect(germanUrl).toContain('/blog?lng=de');
    expect(englishUrl).toBe('https://www.techbyp.com/blog');
  });

  it('renders alternate links for indexable paths', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/blog']}>
          <LocaleAlternates />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      const xDefaultLink = document.head.querySelector('link[rel="alternate"][hreflang="x-default"]');
      expect(xDefaultLink).not.toBeNull();
      expect(xDefaultLink?.getAttribute('href')).toBe(buildLocalizedUrl('/blog', DEFAULT_LOCALE));
    });

    SUPPORTED_LOCALES.forEach((locale) => {
      const localeLink = document.head.querySelector(`link[rel="alternate"][hreflang="${locale}"]`);
      expect(localeLink).not.toBeNull();
      expect(localeLink?.getAttribute('href')).toBe(buildLocalizedUrl('/blog', locale));
    });
  });

  it('does not render alternates for non-indexable paths', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <LocaleAlternates />
        </MemoryRouter>
      </HelmetProvider>
    );

    await waitFor(() => {
      const localeLink = document.head.querySelector('link[rel="alternate"][hreflang="de"]');
      expect(localeLink).toBeNull();
    });
  });
});
