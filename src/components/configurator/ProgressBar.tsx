import { motion, AnimatePresence } from 'framer-motion';
import { useConfigurator } from './contexts/ConfiguratorContext';
import { useMediaQuery } from 'react-responsive';
import { ConfiguratorStep } from './types/configurator';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  steps: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  currentStepIndex: number;
}

export const ProgressBar = ({ steps, currentStepIndex }: ProgressBarProps) => {
  const { t } = useTranslation();
  const { configuration, goToStep } = useConfigurator();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const isSixteenExpress = configuration.product?.productKey === 'sixteen_express';

  const handleStepClick = (stepId: string) => {
    // Always allow going back to product selection
    if (stepId === 'product-selection') {
      goToStep('product-selection' as ConfiguratorStep);
      return;
    }

    // For Sixteen Express, only allow specific steps
    if (isSixteenExpress) {
      const allowedSteps: ConfiguratorStep[] = ['extras', 'customer-info', 'summary'];
      if (allowedSteps.includes(stepId as ConfiguratorStep)) {
        goToStep(stepId as ConfiguratorStep);
      }
      return;
    }

    // Normal product flow - allow any previous step
    const clickedIndex = steps.findIndex(step => step.id === stepId);
    if (clickedIndex <= currentStepIndex) {
      goToStep(stepId as ConfiguratorStep);
    }
  };

  const getStepSummary = (stepId: string) => {
    const isSkippedStep = isSixteenExpress &&
      ['mounting-method', 'vehicle-mounting', 'powerpacks'].includes(stepId);

    if (isSkippedStep) {
      return t('progress.included');
    }

    switch (stepId) {
      case 'product-selection':
        return configuration.product
          ? `${t('progress.selected')} ${configuration.product.name.slice(0, isMobile ? 12 : 20)}`
          : t('progress.notSelected');
      case 'mounting-method':
        return configuration.mountingMethod
          ? `${t('progress.gear')} ${configuration.mountingMethod.charAt(0).toUpperCase()}${configuration.mountingMethod.slice(1)}`
          : t('progress.notSelected');
      case 'vehicle-mounting':
        if (configuration.vehicleMountingType) {
          const mountingProduct = configuration.products?.find(p => p.id === configuration.vehicleMountingType);
          return `${t('progress.car')} ${mountingProduct?.name || configuration.vehicleMountingType}`;
        }
        return t('progress.notSelected');
      case 'powerpacks':
        return configuration.powerpackType
          ? t('progress.powerPackSelected')
          : configuration.powerpackRequired
            ? t('progress.powerPackRequired')
            : t('progress.powerPackOptional');
      case 'extras':
        return configuration.extras.length > 0
          ? t('progress.extrasSelected', { count: configuration.extras.length })
          : t('progress.noExtras');
      case 'customer-info':
        return configuration.customerInfo.name
          ? (isMobile ? t('progress.done') : t('progress.detailsProvided'))
          : t('progress.notCompleted');
      default:
        return '';
    }
  };

  if (isMobile) {
    return (
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 -translate-y-1/2 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-brandgreen to-green-300 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                transition: { duration: 0.6, ease: 'easeOut' }
              }}
            />
          </div>

          {steps.map((step, index) => (
            <button
              key={step.id}
              className="relative z-10 flex flex-col items-center"
              onClick={() => handleStepClick(step.id)}
              disabled={
                index > currentStepIndex ||
                (isSixteenExpress && step.id !== 'product-selection')
              }
              aria-label={step.label}
            >
              <motion.div
                className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${index < currentStepIndex ? 'bg-brandgreen text-white' :
                  index === currentStepIndex ? 'bg-white border-2 border-brandgreen text-brandgreen shadow-md' :
                    'bg-white border border-gray-200 text-gray-400'
                  }`}
                whileTap={{ scale: 0.95 }}
              >
                {step.icon || index + 1}
              </motion.div>

              <AnimatePresence>
                {index === currentStepIndex && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap"
                  >
                    {step.label}
                    <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-800 transform -translate-x-1/2 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        <AnimatePresence>
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-gray-50 rounded-lg text-sm"
          >
            <div className="font-medium text-gray-700">
              {steps[currentStepIndex].label}:
            </div>
            <div className="text-brandgreen font-semibold">
              {getStepSummary(steps[currentStepIndex].id).replace(/^[^a-zA-Z0-9]+/, '')}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative">
        <div className="absolute top-1/2 h-2 w-full bg-gray-100 -translate-y-1/2 rounded-full"></div>

        <motion.div
          className="absolute top-1/2 h-2 bg-gradient-to-r from-brandgreen to-green-300 -translate-y-1/2 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
        />

        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const isSkippedStep = isSixteenExpress &&
              ['mounting-method', 'vehicle-mounting', 'powerpacks'].includes(step.id);

            return (
              <button
                key={step.id}
                className="flex flex-col items-center w-full group"
                onClick={() => handleStepClick(step.id)}
                disabled={
                  index > currentStepIndex ||
                  (isSixteenExpress && step.id !== 'product-selection')
                }
                aria-label={step.label}
              >
                <div className="flex flex-col items-center w-full relative">
                  <motion.div
                    className={`h-12 w-12 rounded-full flex items-center justify-center shadow-sm ${isSkippedStep ? 'bg-green-100 text-brandgreen border-2 border-brandgreen' :
                      index < currentStepIndex ? 'bg-brandgreen text-white' :
                        index === currentStepIndex ? 'bg-white border-3 border-brandgreen text-brandgreen shadow-md' :
                          'bg-white border border-gray-200 text-gray-400'
                      }`}
                    whileHover={{ scale: index <= currentStepIndex ? 1.05 : 1 }}
                    whileTap={{ scale: index <= currentStepIndex ? 0.95 : 1 }}
                  >
                    {isSkippedStep ? '✓' :
                      step.icon || (
                        <span className="font-medium">
                          {index < currentStepIndex ? '✓' : index + 1}
                        </span>
                      )}
                  </motion.div>

                  <motion.span
                    className={`mt-3 text-sm font-medium ${isSkippedStep ? 'text-brandgreen' :
                      index < currentStepIndex ? 'text-brandgreen' :
                        index === currentStepIndex ? 'text-brandgreen font-semibold' :
                          'text-gray-500'
                      }`}
                    whileHover={{ scale: index <= currentStepIndex ? 1.05 : 1 }}
                  >
                    {step.label}
                  </motion.span>
                </div>

                {(index <= currentStepIndex || isSkippedStep) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    className="mt-2 px-2 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%]"
                    whileHover={{ backgroundColor: index <= currentStepIndex ? '#f0f0f0' : 'inherit' }}
                  >
                    {getStepSummary(step.id)}
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};