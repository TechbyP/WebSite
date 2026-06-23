import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import OrderNow from '../components/OrderNow';
import { ProductsProvider, useProducts } from '../data/context/ProductsContext';
import { buildCanonicalUrl, normalizeResourceId } from '../utils/seo';

function OrderNowPageContent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const { getProductById } = useProducts();
  const normalizedProductId = normalizeResourceId(id);
  const productId = Number.parseInt(normalizedProductId, 10);
  const product = Number.isNaN(productId) ? undefined : getProductById(productId);
  const pageTitle = product?.name
    ? `${product.name} | ${t('product.orderNow')} | TECHBYP`
    : `${t('product.orderNow')} | TECHBYP`;
  const pageDescription = product?.name
    ? `${t('orderNow.title')} ${product.name}.`
    : t('orderNow.title');
  const orderPath = normalizedProductId ? `/order/${normalizedProductId}` : '/order';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={buildCanonicalUrl(orderPath)} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={buildCanonicalUrl(orderPath)} />
      </Helmet>
      <OrderNow
        onClose={() => navigate(product ? `/product/${product.id}` : '/')}
        productId={normalizedProductId}
        productName={product?.name}
      />
    </>
  );
}

export default function OrderNowPage() {
  return (
    <ProductsProvider>
      <OrderNowPageContent />
    </ProductsProvider>
  );
}