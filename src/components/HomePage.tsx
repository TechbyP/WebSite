// HomePage.jsx
import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import Announcement from '../utils/Announcement';
import CombinedHero from './HeroNews';

// Lazy-load non-critical sections
const ProductShowcase = lazy(() => import('./ProductShowcase'));
const Applications = lazy(() => import('./Applications'));
const About = lazy(() => import('./About'));
const Trust = lazy(() => import('./Trust'));
const Newsletter = lazy(() => import('./Newsletter'));

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
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Above-the-fold content */}
      <Announcement />
      <CombinedHero /> {/* Hero image is LCP-critical */}

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
