// HomePage.jsx
import { Helmet } from 'react-helmet-async';
import Announcement from '../utils/Announcement';
import CombinedHero from './HeroNews';
import ProductShowcase from './ProductShowcase';
import Applications from './Applications';
import About from './About';
import Trust from './Trust';
import Newsletter from './Newsletter';

export default function HomePage() {
  return (
    <>
    <Helmet>
  <title>Home | TECHBYP | German Soil Sampling Experts</title>
  <meta name="description" content="TECHBYP crafts precision soil sampling machines—from hand‑held tools to heavy‑duty trailer systems—right here in northern Germany. Reliable, efficient, and engineered for professionals." />
  <meta property="og:title" content="TECHBYP – Precision Soil Sampling Technology" />
  <meta property="og:description" content="Explore TECHBYP’s German‑engineered soil sampling equipment—manual, machine‑driven, bespoke systems designed for accurate, reproducible sampling." />
  <meta name="robots" content="index, follow" />
</Helmet>

      <Announcement />
      <CombinedHero />
      <ProductShowcase />
      <Applications />
      <About />
      <Trust />
      <Newsletter />
    </>
  );
}
