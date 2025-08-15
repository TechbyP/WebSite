import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import trailerImg from '../../../assets/Trailers/1.jpg';
import vehicleImg from '../../../assets/Frames/Full-Conversion/2.jpg';
import { useTranslation } from 'react-i18next';

export const MountingMethodStep = () => {
  const { t } = useTranslation();
  const { configuration, setMountingMethod, goToStep } = useConfigurator();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeInWhenVisible>
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-black mt-4 md:mt-6 uppercase">
            {t('mountingMethod.title')}
          </h2>
          <p className="text-center text-brandblue max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
            {t('mountingMethod.subtitle', { productName: configuration.product?.name || '' })}
          </p>
        </div>
      </FadeInWhenVisible>

      {/* Mobile version */}
      <div className="md:hidden space-y-4 max-w-[800px] mx-auto px-4">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden
            hover:shadow-lg transition-all duration-300
            flex items-center h-24
            ${configuration.mountingMethod === 'trailer'
              ? 'ring-2 ring-brandgreen bg-green-50'
              : 'border border-gray-200 hover:border-gray-300'}
          `}
          onClick={() => setMountingMethod('trailer')}
        >
          <div className="relative h-full w-24 flex-shrink-0">
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
srcSet={trailerImg}
              alt={t('mountingMethod.trailer.alt')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col px-4 py-2 overflow-hidden">
            <h3 className="text-sm font-black text-gray-900 uppercase truncate">
              {t('mountingMethod.trailer.title')}
            </h3>
            <h2 className="text-xs font-bold text-gray-900 uppercase truncate">
              {t('mountingMethod.trailer.subtitle')}
            </h2>
            <div className="text-xs font-bold text-brandgreen mt-1">
              {t('mountingMethod.trailer.price')}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden
            hover:shadow-lg transition-all duration-300
            flex items-center h-24
            ${configuration.mountingMethod === 'vehicle'
              ? 'ring-2 ring-brandgreen bg-green-50'
              : 'border border-gray-200 hover:border-gray-300'}
          `}
          onClick={() => setMountingMethod('vehicle')}
        >
          <div className="relative h-full w-24 flex-shrink-0">
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
srcSet={vehicleImg}
              alt={t('mountingMethod.vehicle.alt')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col px-4 py-2 overflow-hidden">
            <h3 className="text-sm font-black text-gray-900 uppercase truncate">
              {t('mountingMethod.vehicle.title')}
            </h3>
            <h2 className="text-xs font-bold text-gray-900 uppercase truncate">
              {t('mountingMethod.vehicle.subtitle')}
            </h2>
            <div className="text-xs font-bold text-brandgreen mt-1">
              {t('mountingMethod.vehicle.price')}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop version */}
      <div className="hidden md:grid max-w-[800px] mx-auto grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden
            hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
            border-2
            ${configuration.mountingMethod === 'trailer'
              ? 'ring-2 ring-brandgreen border-transparent bg-green-50'
              : 'border-gray-200 hover:border-gray-300'}
            flex flex-col h-full
          `}
          onClick={() => setMountingMethod('trailer')}
        >
          <div className="relative overflow-hidden h-80">
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
srcSet={trailerImg}
              alt={t('mountingMethod.trailer.alt')}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">
              {t('mountingMethod.trailer.title')}
            </h3>
            <p className="text-gray-600 flex-grow">
              {t('mountingMethod.trailer.description')}
            </p>
            <div className="text-lg font-bold text-brandgreen">
              {t('mountingMethod.trailer.price')}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden
            hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
            border-2
            ${configuration.mountingMethod === 'vehicle'
              ? 'ring-2 ring-brandgreen border-transparent bg-green-50'
              : 'border-gray-200 hover:border-gray-300'}
            flex flex-col h-full
          `}
          onClick={() => setMountingMethod('vehicle')}
        >
          <div className="relative overflow-hidden h-80">
            <img
              sizes="(max-width: 768px) 50vw, 25vw"
srcSet={vehicleImg}
              alt={t('mountingMethod.vehicle.alt')}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase">
              {t('mountingMethod.vehicle.title')}
            </h3>
            <p className="text-gray-600 flex-grow">
              {t('mountingMethod.vehicle.description')}
            </p>
            <div className="text-lg font-bold text-brandgreen">
              {t('mountingMethod.vehicle.price')}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 md:mt-12 flex justify-between">
        <button
          onClick={() => goToStep('mounting-method')}
          className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
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
