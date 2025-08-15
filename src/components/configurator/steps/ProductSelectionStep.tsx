import { motion } from 'framer-motion';
import { Product } from '../../../data/types/products'
import { initializeProducts, } from '../../../data/products';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react';
import { handleImageError, defaultHeroImage } from '../../../utils/DefaultPics';
import { useTranslation } from 'react-i18next';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="bg-red-50 p-4 rounded-lg">
      <p className="text-red-600 font-bold">{t('error.somethingWentWrong')}:</p>
      <pre className="text-red-500">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        {t('error.tryAgain')}
      </button>
    </div>
  );
}

interface ProductSelectionStepProps {
  products: Product[];
}

export const ProductSelectionStep = ({ products }: ProductSelectionStepProps) => {
  const { configuration, setProduct } = useConfigurator();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeProducts(t);
    setReady(false); // reset before init
    setTimeout(() => {
      setReady(true); // trigger re-render *after* initialization
    }, 0);
  }, [t]);

  // Filter products to only include those with category "SmartSystems"
  const smartSystemProducts = products.filter((product) => product.category === 'SmartSystems');

  // Auto-scroll to selected product if one exists
  useEffect(() => {
    if (configuration.product) {
      const element = document.getElementById(`product-${configuration.product.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [configuration.product]);



  if (!ready) {
    return <div>{t('product.notFound')}</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <FadeInWhenVisible>
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-black mt-4 md:mt-6 uppercase">
              {t('productSelection.title')}
            </h2>
            <p className="text-center text-brandblue max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
              {t('productSelection.description')}
            </p>
          </div>
        </FadeInWhenVisible>
      </ErrorBoundary>

      {/* Mobile version */}
      <div className="md:hidden space-y-3">
        {smartSystemProducts.map((product) => {
          const Icon = product.icon;
          return (
            <motion.div
              key={product.id}
              id={`product-${product.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden 
                hover:shadow-lg transition-all duration-300
                flex items-center h-24
                ${configuration.product?.id === product.id
                  ? 'ring-2 ring-brandgreen'
                  : 'border border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setProduct(product)}
            >
              <div className="relative h-full w-24 flex-shrink-0">
                <img
                  src={product.image || defaultHeroImage}
                  alt={product.name || t('productSelection.unnamedProduct')}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => handleImageError(e, defaultHeroImage)}
                />
                {product.bestseller && (
                  <div className="absolute top-1 right-1 bg-white/90 px-1 py-0.5 rounded text-[10px] font-semibold text-gray-900">
                    {t('productSelection.bestsellerShort')}
                  </div>
                )}
              </div>

              <div className="flex flex-col px-4 py-2 overflow-hidden">
                <div className="flex items-center space-x-1">
                  {Icon && <Icon className="h-3 w-3 text-brandblue" />}
                  <span className="text-[10px] font-medium text-brandblue">{t('productSelection.smartTag')}</span>
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase truncate">
                  {product.name || t('productSelection.unnamedProduct')}
                </h3>
                <h2 className="text-xs font-bold text-gray-900 uppercase truncate">
                  {product.nickname || t('productSelection.product')}
                </h2>
                <div className="text-xs font-bold text-brandgreen mt-1">
                  {product.price || t('productSelection.priceUnavailable')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop version */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {smartSystemProducts.map((product) => {
          const Icon = product.icon;
          return (
            <motion.div
              key={product.id}
              id={`product-${product.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden 
                hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
                flex flex-col h-full
                ${configuration.product?.id === product.id
                  ? 'ring-2 ring-brandgreen'
                  : 'border border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setProduct(product)}
            >
              <div className="relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image || defaultHeroImage}
                    alt={product.name || t('productSelection.unnamedProduct')}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.image || defaultHeroImage}
                      alt={product.name || t('productSelection.unnamedProduct')}
                      onError={(e) => handleImageError(e, defaultHeroImage)}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-brandblue bg-blue-100 rounded-full">
                    {Icon && <Icon className="h-4 w-4 mr-1" />}
                    <span>{t('productSelection.smartSystemsTag')}</span>
                  </span>
                </div>
                {product.bestseller && (
                  <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded text-xs font-semibold text-gray-900">
                    {t('productSelection.bestseller')}
                  </div>
                )}
              </div>

              <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1 uppercase">
                    {product.nickname || t('productSelection.product')}
                  </h2>
                  <h3 className="text-2xl font-black text-gray-900 uppercase">
                    {product.name || t('productSelection.unnamedProduct')}
                  </h3>
                </div>

                <div className="flex-grow flex flex-col justify-center mt-4">
                  <p className="text-gray-600 text-sm mb-4">
                    {product.description || t('productSelection.noDescription')}
                  </p>
                  <div className="space-y-2">
                    {product.specs?.slice(0, 4).map((spec: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-[6px] h-[6px] bg-brandblue rounded-full mr-2 flex-shrink-0"></div>
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-lg font-bold text-brandgreen">
                    {product.price || t('productSelection.priceUnavailable')}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
