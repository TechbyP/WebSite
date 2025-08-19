import { ProductSelectionStep } from './steps/ProductSelectionStep';
import { MountingMethodStep } from './steps/MountingMethodStep';
import { VehicleMountingStep } from './steps/VehicleMountingStep';
import { ExtrasStep } from './steps/ExtrasStep';
import { CustomerInfoStep } from './steps/CustomerInfoStep';
import { useConfigurator } from './contexts/ConfiguratorContext';
import { Product } from '../../data/products';
import { ProgressBar } from './ProgressBar';
import { PowerPacksStep } from './steps/PowerPacksStep';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ConfiguratorProps {
  products: Product[];
}

export const Configurator = ({ products = [] }: ConfiguratorProps) => {
  const { currentStep, configuration } = useConfigurator();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const steps = [
    { id: 'product-selection', label: t('configurator.steps.product') },
    { id: 'mounting-method', label: t('configurator.steps.mounting') },
    { id: 'vehicle-mounting', label: t('configurator.steps.vehicleType'), condition: configuration.mountingMethod === 'vehicle' },
    { id: 'powerpacks', label: t('configurator.steps.power') },
    { id: 'extras', label: t('configurator.steps.extras') },
    { id: 'customer-info', label: t('configurator.steps.finish') },
  ];

  const isExpress = configuration.product?.productKey === 'sixteen_express';
  
  const visibleSteps = isExpress
    ? steps.filter(step => 
        step.id === 'product-selection' || 
        step.id === 'extras' || 
        step.id === 'customer-info'
      )
    : configuration.mountingMethod === 'trailer'
      ? steps.filter(step => step.id !== 'vehicle-mounting')
      : steps;

  const currentStepIndex = visibleSteps.findIndex(step => step.id === currentStep);

  return (
   <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 transition-colors duration-500">

      <div className="max-w-7xl mx-auto">
        <ProgressBar
          steps={visibleSteps}
          currentStepIndex={currentStepIndex}
        />

        <div className="mt-8">
          {currentStep === 'product-selection' && (
            <ProductSelectionStep products={products} />
          )}
          {currentStep === 'mounting-method' && <MountingMethodStep />}
          {currentStep === 'vehicle-mounting' && <VehicleMountingStep />}
          {currentStep === 'powerpacks' && <PowerPacksStep />}
          {currentStep === 'extras' && <ExtrasStep products={products} />}
          {currentStep === 'customer-info' && <CustomerInfoStep />}
        </div>
      </div>
    </div>
  );
};
