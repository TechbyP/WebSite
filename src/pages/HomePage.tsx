// HomePage.jsx
import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import Announcement from '../utils/Announcement';
import CombinedHero from './HeroNews';
import { buildCanonicalUrl, toAbsoluteUrl } from '../utils/seo';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TechByP',
  url: buildCanonicalUrl('/'),
  logo: toAbsoluteUrl('/Logo-Symbol.png'),
  description: 'German-engineered soil sampling systems and accessories for professional field work.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: buildCanonicalUrl('/contact'),
      availableLanguage: ['en', 'de', 'es', 'fr', 'ro', 'pt', 'ru'],
    },
  ],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TechByP',
  url: buildCanonicalUrl('/'),
  inLanguage: ['en', 'de', 'es', 'fr', 'ro', 'pt', 'ru'],
};

// Lazy-load non-critical sections
const ProductShowcase = lazy(() => import('./ProductShowcase'));
const Applications = lazy(() => import('./Applications'));
const About = lazy(() => import('./About'));
const Trust = lazy(() => import('./Trust'));
const Newsletter = lazy(() => import('../components/Newsletter'));

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home | TECHBYP | German Soil Sampling Experts</title>
        <meta
          name="description"
          content="TECHBYP crafts precision soil sampling machines—from hand‑held tools to heavy‑duty trailer systems—right here in northern Germany. Reliable, efficient, and engineered for professionals."
        />
        <meta property="og:title" content="TECHBYP – Precision Soil Sampling Technology" />
        <meta
          property="og:description"
          content="Explore TECHBYP’s German‑engineered soil sampling equipment—manual, machine‑driven, bespoke systems designed for accurate, reproducible sampling."
        />
        <meta property="og:url" content={buildCanonicalUrl('/')} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonicalUrl('/')} />
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webSiteSchema)}</script>
      </Helmet>

      {/* Above-the-fold content */}
      <Announcement />
      <CombinedHero /> 

      {/* Lazy-load below-the-fold content */}
      <Suspense fallback={<div>Loading content...</div>}>
        <ProductShowcase />
        <Applications />
        <About />
        <Trust />
        <Newsletter />
      </Suspense>
    </>
  );
}
