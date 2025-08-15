import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import { Product } from '../../../data/products';
import { ErrorBoundary } from 'react-error-boundary';
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

interface ExtrasStepProps {
  products: Product[];
}

export const ExtrasStep = ({ products = [] }: ExtrasStepProps) => {
  const { configuration, toggleExtra, goToStep } = useConfigurator();
  const { t } = useTranslation();

  const extraProducts = products.filter(
    (p) => p.categoryName?.toLowerCase() === 'extras'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <FadeInWhenVisible>
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-black mt-4 md:mt-6 uppercase">
              {t('extrasStep.title')}
            </h2>
            <p className="text-center text-brandblue max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
              {t('extrasStep.description', { productName: configuration.product?.name || '' })}
            </p>
          </div>
        </FadeInWhenVisible>
      </ErrorBoundary>

      {/* Mobile version */}
      <div className="md:hidden space-y-3">
        {extraProducts.map((product) => {
          const selected = configuration.extras.includes(product.id.toString());
          return (
            <motion.div
              key={product.id}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden 
                hover:shadow-lg transition-all duration-300
                flex items-center h-24
                ${selected ? 'ring-2 ring-brandgreen bg-green-50' : 'border border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => toggleExtra(product.id.toString())}
            >
              <div className="relative h-full w-24 flex-shrink-0">
                <img
                  src={product.image || defaultHeroImage}
                  alt={product.name || t('extrasStep.unnamedProduct')}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => handleImageError(e, defaultHeroImage)}
                />
                <div className="absolute top-1 right-1 flex items-center justify-center">
                  <div className={`h-4 w-4 rounded border ${selected ? 'bg-brandgreen border-brandgreen' : 'bg-white border-gray-300'}`}>
                    {selected && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col px-4 py-2 overflow-hidden">
                <h3 className="text-sm font-bold text-gray-900 uppercase truncate">
                  {product.name || t('extrasStep.unnamedProduct')}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {product.description || t('extrasStep.noDescription')}
                </p>
                <div className="text-xs font-bold text-brandgreen mt-1">
                  {product.price || t('extrasStep.priceNotAvailable')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop version */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {extraProducts.map((product) => {
          const selected = configuration.extras.includes(product.id.toString());
          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden
                hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
                flex flex-col h-full
                ${selected ? 'ring-2 ring-brandgreen border-transparent bg-green-50' : 'border border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => toggleExtra(product.id.toString())}
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={product.image || defaultHeroImage}
                  alt={product.name || t('extrasStep.unnamedProduct')}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => handleImageError(e, defaultHeroImage)}
                />
                <div className="absolute top-4 right-4 flex items-center justify-center">
                  <div className={`h-5 w-5 rounded border ${selected ? 'bg-brandgreen border-brandgreen' : 'bg-white border-gray-300'}`}>
                    {selected && (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">
                    {product.name || t('extrasStep.unnamedProduct')}
                  </h3>
                </div>

                <div className="flex-grow flex flex-col justify-center mt-4">
                  <ul className="text-sm text-gray-500 space-y-2">
                    {product.specs?.slice(0, 2).map((spec, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-[6px] h-[6px] bg-brandblue rounded-full mr-2 flex-shrink-0"></div>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <div className="text-lg font-bold text-brandgreen">
                    {product.price || t('extrasStep.priceNotAvailable')}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 md:mt-12 flex justify-between">
        <button
          onClick={() =>
            goToStep(configuration.mountingMethod === 'trailer' ? 'mounting-method' : 'vehicle-mounting')
          }
          className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
        >
          ← {t('buttons.back')}
        </button>
        <button
          onClick={() => goToStep('customer-info')}
          className="px-4 py-2 md:px-6 md:py-3 bg-brandgreen text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm md:text-base"
        >
          {t('buttons.continue')} →
        </button>
      </div>
    </div>
  );
};
