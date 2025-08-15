import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import { products } from '../../../data/products';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { initializeProducts } from '../../../data/products';
import { useEffect } from 'react';

export const PowerPacksStep = () => {
  const {
    configuration,
    setPowerpackType,
    goToStep
  } = useConfigurator();

  const { t } = useTranslation();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeProducts(t);
    setReady(false); // reset before init
    setTimeout(() => {
      setReady(true); // trigger re-render *after* initialization
    }, 0);
  }, [t]);

  const [showPowerpackWarning, setShowPowerpackWarning] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);

  const order = ['Power Pack'];

  const normalizeName = (name: string) =>
    name.toLowerCase()
      .replace(/‑/g, '-')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedOrder = order.map(normalizeName);

  const powerPackProducts = products
    .filter(product =>
      product.category === 'accessory' &&
      product.type === 'Powerpack' &&
      normalizedOrder.includes(normalizeName(product.name))
    )
    .sort((a, b) => {
      if (normalizedOrder.length > 0) {
        const aIndex = normalizedOrder.indexOf(normalizeName(a.name));
        const bIndex = normalizedOrder.indexOf(normalizeName(b.name));
        return aIndex - bIndex;
      }
      return 0;
    });

  const handleContinue = () => {
    if (!configuration.powerpackType) {
      setShowPowerpackWarning(true);
      return;
    }
    goToStep('extras');
  };

  const handlePowerpackClick = (productId: string) => {
    if (configuration.powerpackType === productId) {
      setPowerpackType('');
    } else {
      setPowerpackType(productId);
    }
  };
  if (!ready) {
    return <div>{t('product.notFound')}</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Dialog
        open={showPowerpackWarning}
        onClose={() => setShowPowerpackWarning(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">
              {t('powerpackWarning.title')}
            </Dialog.Title>
            <Dialog.Description className="text-gray-700 mb-6">
              {configuration.mountingMethod === 'trailer'
                ? t('powerpackWarning.trailerMessage')
                : t('powerpackWarning.vehicleMessage')}
            </Dialog.Description>

            <div className="flex items-start space-x-3 mb-6">
              <input
                type="checkbox"
                id="acknowledge-warning"
                checked={acknowledgedWarning}
                onChange={(e) => setAcknowledgedWarning(e.target.checked)}
                className="w-5 h-5 text-brandgreen focus:ring-brandgreen border-gray-300 rounded mt-1"
              />
              <label htmlFor="acknowledge-warning" className="text-gray-700">
                {t('powerpackWarning.acknowledge')}
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPowerpackWarning(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('powerpackWarning.goBack')}
              </button>
              <button
                onClick={() => {
                  if (acknowledgedWarning) {
                    setShowPowerpackWarning(false);
                    goToStep('extras');
                  }
                }}
                disabled={!acknowledgedWarning}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${acknowledgedWarning
                    ? 'bg-brandgreen text-white hover:bg-green-700 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
              >
                {t('powerpackWarning.proceed')}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <FadeInWhenVisible>
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-black leading-tight text-black mt-4 md:mt-6 uppercase">
            {t('powerOptions.title')}
          </h2>
          <p className="text-center text-brandblue max-w-4xl mx-auto mb-2 text-sm md:text-base font-black">
            {configuration.mountingMethod === 'trailer'
              ? t('powerOptions.trailerDescription')
              : t('powerOptions.vehicleDescription')}
          </p>
        </div>
      </FadeInWhenVisible>

      {/* Mobile version */}
      <div className="md:hidden space-y-3 max-w-[800px] mx-auto px-4">
        {powerPackProducts.map((product) => {
          const selected = configuration.powerpackType === product.id.toString();

          return (
            <motion.div
              key={product.id}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer bg-white rounded-lg shadow-md overflow-hidden
                hover:shadow-lg transition-all duration-300
                flex items-center h-24
                ${selected
                  ? 'ring-2 ring-brandgreen bg-green-50'
                  : 'border border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => handlePowerpackClick(product.id.toString())}
            >
              <div className="relative h-full w-24 flex-shrink-0">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
srcSet={product.image}
                  alt={t(`products.${product.id}.name`, product.name)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {selected && (
                  <div className="absolute top-1 right-1 bg-brandgreen text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col px-4 py-2 overflow-hidden">
                <h3 className="text-sm font-black text-gray-900 uppercase truncate">
                  {t(`products.${product.id}.name`, product.name)}
                </h3>
                <h2 className="text-xs font-bold text-gray-900 uppercase truncate">
                  {t(`products.${product.id}.nickname`, product.nickname || 'Product')}
                </h2>
                <div className="text-xs font-bold text-brandgreen mt-1">
                  {t(`products.${product.id}.price`, product.price || 'Price not available')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop version */}
      <div className="hidden md:flex max-w-[800px] mx-auto justify-center px-4 sm:px-6 lg:px-8">
        {powerPackProducts.map((product) => {
          const selected = configuration.powerpackType === product.id.toString();

          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden
                hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
                border-2 w-full max-w-md
                ${selected
                  ? 'ring-2 ring-brandgreen border-transparent bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'}
                flex flex-col h-full
              `}
              onClick={() => handlePowerpackClick(product.id.toString())}
            >
              <div className="relative overflow-hidden h-48">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
srcSet={product.image}
                  alt={t(`products.${product.id}.name`, product.name)}
                  className="w-full h-full object-right object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {selected && (
                  <div className="absolute top-2 right-2 bg-brandgreen text-white rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col grow">
                <h3 className="text-2xl font-black text-gray-900 uppercase">
                  {t(`products.${product.id}.name`, product.name)}
                </h3>
                <h2 className="text-sm  text-gray-900 mb-2 mt-1">
                  {t(`products.${product.id}.nickname`, product.description || 'Product')}
                </h2>
                <div className="text-base font-bold text-brandgreen mt-auto">
                  {t(`products.${product.id}.price`, product.price || 'Price not available')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-10 md:mt-16">
        <button
          className="bg-brandgreen hover:bg-green-700 transition-colors text-white font-bold rounded-lg py-3 px-6 md:py-4 md:px-8 uppercase tracking-wide"
          onClick={handleContinue}
        >
          {t('common.continue')}
        </button>
      </div>
    </div>
  );
};
