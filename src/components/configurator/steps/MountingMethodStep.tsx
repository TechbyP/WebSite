import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import trailerImg from '../../../assets/Trailers/1.jpg';
import vehicleImg from '../../../assets/Frames/Full-Conversion/2.jpg';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { getLowestPriceDisplay, getPriceDisplay } from '../../../data/prices';

export const MountingMethodStep = () => {
  const { t } = useTranslation();
  const { configuration, setMountingMethod, goToStep } = useConfigurator();
  const language = i18n.resolvedLanguage || i18n.language || 'en';
  const mountingOptions = [
    { type: 'trailer', img: trailerImg },
    { type: 'vehicle', img: vehicleImg },
  ] as const;

  const getMountingPrice = (type: 'trailer' | 'vehicle') => {
    if (type === 'trailer') {
      return getPriceDisplay('trailer', language, t);
    }

    return getLowestPriceDisplay(['laydown', 'tph', 'fc'], language, t);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Optional Dark/Light Mode Toggle */}
      {/* <button onClick={toggleTheme} className="mb-4 px-3 py-1 border rounded">
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button> */}

      <FadeInWhenVisible>
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-gray-900 dark:text-white mt-4 md:mt-6 uppercase">
            {t('mountingMethod.title')}
          </h2>
          <p className="text-center text-brandblue dark:text-brandgreen max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
            {t('mountingMethod.subtitle', { productName: configuration.product?.name || '' })}
          </p>
        </div>
      </FadeInWhenVisible>

      {/* Mobile version */}
      <div className="md:hidden space-y-4 max-w-[800px] mx-auto px-4">
        {mountingOptions.map((item) => (
          <motion.div
            key={item.type}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
              hover:shadow-lg transition-all duration-300 flex items-center h-24
              ${configuration.mountingMethod === item.type
                ? 'ring-2 ring-brandgreen bg-green-50 dark:bg-green-900'
                : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}
            `}
            onClick={() => setMountingMethod(item.type)}
          >
            <div className="relative h-full w-24 flex-shrink-0">
              <img
                sizes="(max-width: 768px) 50vw, 25vw"
                srcSet={item.img}
                alt={t(`mountingMethod.${item.type}.alt`)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col px-4 py-2 overflow-hidden">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">
                {t(`mountingMethod.${item.type}.title`)}
              </h3>
              <h2 className="text-xs font-bold text-gray-900 dark:text-gray-200 uppercase truncate">
                {t(`mountingMethod.${item.type}.subtitle`)}
              </h2>
              <div className="text-xs font-bold text-brandgreen dark:text-brandgreen mt-1">
                {getMountingPrice(item.type)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop version */}
      <div className="hidden md:grid max-w-[800px] mx-auto grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8">
        {mountingOptions.map((item) => (
          <motion.div
            key={item.type}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden
              hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-2
              ${configuration.mountingMethod === item.type
                ? 'ring-2 ring-brandgreen border-transparent bg-green-50 dark:bg-green-900'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'}
              flex flex-col h-full
            `}
            onClick={() => setMountingMethod(item.type)}
          >
            <div className="relative overflow-hidden h-80">
              <img
                sizes="(max-width: 768px) 50vw, 25vw"
                srcSet={item.img}
                alt={t(`mountingMethod.${item.type}.alt`)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase">
                {t(`mountingMethod.${item.type}.title`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {t(`mountingMethod.${item.type}.description`)}
              </p>
              <div className="text-lg font-bold text-brandgreen dark:text-brandgreen">
                {getMountingPrice(item.type)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-6 md:mt-12 flex justify-between">
        <button
          onClick={() => goToStep('product-selection')}
          className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm md:text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
        >
          ← {t('buttons.back')}
        </button>
        {configuration.mountingMethod && (
          <button
            onClick={() => goToStep('extras')}
            className="px-4 py-2 md:px-6 md:py-3 bg-brandgreen hover:bg-green-700 dark:bg-brandgreen dark:hover:bg-green-700 text-white rounded-lg transition-colors font-semibold text-sm md:text-base"
          >
            {t('buttons.continue')} →
          </button>
        )}
      </div>
    </div>
  );
};
