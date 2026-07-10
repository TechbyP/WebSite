import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Configurator } from '../components/configurator/Configurator';
import { ConfiguratorProvider, useConfigurator } from '../components/configurator/contexts/ConfiguratorContext';
import { ProductsProvider, useProducts } from '../data/context/ProductsContext';
import { buildCanonicalUrl } from '../utils/seo';

function ConfiguratorRouteInitializer() {
  const location = useLocation();
  const { startWithProduct } = useConfigurator();
  const lastAppliedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const productIdParam = new URLSearchParams(location.search).get('productId');
    const parsedProductId = Number.parseInt(productIdParam || '', 10);

    if (Number.isNaN(parsedProductId)) {
      lastAppliedTokenRef.current = null;
      return;
    }

    const routeToken = `${location.key}:${parsedProductId}`;

    if (lastAppliedTokenRef.current === routeToken) {
      return;
    }

    startWithProduct(parsedProductId);
    lastAppliedTokenRef.current = routeToken;
  }, [location.key, location.search, startWithProduct]);

  return null;
}

function ConfiguratorPageContent() {
  const { products } = useProducts();

  return (
    <ConfiguratorProvider products={products}>
      <ConfiguratorRouteInitializer />
      <Configurator products={products} />
    </ConfiguratorProvider>
  );
}

export default function ConfiguratorPage() {
  const { t } = useTranslation();

  const legacyConfiguratorLabel = t('navbar.menu.configurator');
  const configuratorLabel =
    legacyConfiguratorLabel === 'navbar.menu.configurator'
      ? t('productCard.configure')
      : legacyConfiguratorLabel;

  const title = `${configuratorLabel} | TECHBYP`;
  const description = t('configurator.productToast.desc1');

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={buildCanonicalUrl('/configurator')} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={buildCanonicalUrl('/configurator')} />
      </Helmet>
      <ProductsProvider>
        <ConfiguratorPageContent />
      </ProductsProvider>
    </>
  );
}