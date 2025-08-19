import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import { products } from '../../../data/products';
import { handleImageError, defaultHeroImage } from '../../../utils/DefaultPics';
import { useTranslation } from 'react-i18next';

export const VehicleMountingStep = () => {
  const { t } = useTranslation();
  const { configuration, setVehicleMountingType, goToStep } = useConfigurator();

  const order = [2000, 2001, 2003]; 

  const mountingProducts = products
    .filter(product => product.category === 'accessory' && order.includes(product.id))
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeInWhenVisible>
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-black dark:text-white mt-4 md:mt-6 uppercase">
            {t('vehicleMounting.title')}
          </h2>
          <p className="text-center text-brandblue dark:text-brandgreen max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
            {t('vehicleMounting.description', { productName: configuration.product?.name })}
          </p>
        </div>
      </FadeInWhenVisible>

      {/* Mobile version */}
      <div className="md:hidden space-y-3">
        {mountingProducts.map((product) => {
          const selected = configuration.vehicleMountingType === product.id;

          return (
            <motion.div
              key={product.id}
              id={`mounting-${product.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden 
                hover:shadow-lg transition-all duration-300
                flex items-center h-24
                ${selected
                  ? 'ring-2 ring-brandgreen'
                  : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              onClick={() => setVehicleMountingType(product.id)}
            >
              <div className="relative overflow-hidden h-full w-24 flex-shrink-0">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
                  srcSet={product.image || defaultHeroImage}
                  alt={product.name}
                  className="w-full h-full object-right object-cover"
                  loading="lazy"
                  onError={(e) => handleImageError(e, defaultHeroImage)}
                />
                {selected && (
                  <div className="absolute top-1 right-1 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-brandgreen border-brandgreen">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col px-4 py-2 overflow-hidden">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-medium text-brandblue dark:text-brandgreen">
                    {t('vehicleMounting.mountingLabel')}
                  </span>
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase truncate">
                  {product.name}
                </h3>
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase truncate">
                  {product.nickname || 'Product'}
                </h2>
                <div className="text-xs font-bold text-brandgreen mt-1">
                  {product.price || 'Price not available'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop version */}
      <div className="hidden md:grid max-w-[1280px] mx-auto grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
        {mountingProducts.map((product) => {
          const selected = configuration.vehicleMountingType === product.id;

          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden
                hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
                border-2
                ${selected
                  ? 'ring-2 ring-brandgreen border-transparent bg-green-50 dark:bg-green-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                flex flex-col h-full
              `}
              onClick={() => setVehicleMountingType(product.id)}
            >
              <div className="relative overflow-hidden h-48">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
                  srcSet={product.image}
                  alt={product.name}
                  className="w-full h-full object-right object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase">
                    {product.name}
                  </h3>
                </div>

                <div className="flex-grow flex flex-col justify-center mt-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {product.description || 'No description available'}
                  </p>
                  <div className="space-y-2">
                    {(product.specs ?? []).slice(0, 2).map((spec: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-[6px] h-[6px] bg-brandblue dark:bg-brandgreen rounded-full mr-2 flex-shrink-0"></div>
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-lg font-bold text-brandgreen">
                    {product.price || 'Price not available'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 md:mt-12 flex justify-between">
        <button
          onClick={() => goToStep('mounting-method')}
          className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm md:text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
        >
          ← {t('buttons.back')}
        </button>
        {configuration.vehicleMountingType && (
          <button
            onClick={() => goToStep('extras')}
            className="px-4 py-2 md:px-6 md:py-3 bg-brandgreen text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm md:text-base"
          >
            {t('buttons.continue')} →
          </button>
        )}
      </div>
    </div>
  );
};
