import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Configurator } from '../components/configurator/Configurator';
import { ConfiguratorProvider, useConfigurator } from '../components/configurator/contexts/ConfiguratorContext';
import { ProductsProvider, useProducts } from '../data/context/ProductsContext';

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
  return (
    <ProductsProvider>
      <ConfiguratorPageContent />
    </ProductsProvider>
  );
}