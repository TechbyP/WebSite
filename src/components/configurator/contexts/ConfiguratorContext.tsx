import { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../../data/types/products';
import { ProductConfiguration, ConfiguratorStep } from '../types/configurator';

interface ConfiguratorContextType {
  configuration: ProductConfiguration;
  currentStep: ConfiguratorStep;
  setProduct: (product: Product) => void;
  setMountingMethod: (method: 'trailer' | 'vehicle') => void;
  setVehicleMountingType: (type: 'lay-down' | 'three-point' | 'full-conversion') => void;
  toggleExtra: (extra: string) => void;
  setCustomerInfo: (info: Partial<ProductConfiguration['customerInfo']>) => void;
  goToStep: (step: ConfiguratorStep) => void;
  resetConfigurator: () => void;
  startWithProduct: (productId?: number) => void;
  setPowerpackType: (type: string | null) => void;
  setPowerpackAcknowledged: (ack: boolean) => void;
  powerpackRequired: boolean;
  showWarning: { visible: boolean; message: string };
}

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(undefined);

export const ConfiguratorProvider = ({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) => {
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<ConfiguratorStep>('product-selection');
  const [showWarning, setShowWarning] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const [configuration, setConfiguration] = useState<ProductConfiguration>({
    product: null,
    mountingMethod: null,
    vehicleMountingType: null,
    extras: [],
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
    powerpackType: null,
    powerpackAcknowledged: false,
    powerpackRequired: false,
  });

const isSixteenExpress = () => {
  return configuration.product?.productKey === 'sixteen_express';
};

  const showJamesMayWarning = (messageKey: string) => {
    const message = t(messageKey);
    setShowWarning({ visible: true, message });
    setTimeout(() => setShowWarning({ visible: false, message: '' }), 3000);
  };

const setProduct = (product: Product) => {
  const isExpress = product.productKey === 'sixteen_express';
  const powerpackRequired = !isExpress && product.productKey !== 'independent_drive_units';
  
  setConfiguration((prev) => ({
    ...prev,
    product,
    mountingMethod: isExpress ? 'vehicle' : null, // Set default for express
    vehicleMountingType: isExpress ? 'full-conversion' : null, // Set default for express
    extras: [],
    powerpackType: null,
    powerpackAcknowledged: false,
    powerpackRequired,
  }));

  setCurrentStep(isExpress ? 'extras' : 'mounting-method');
};


const startWithProduct = (productId: number) => {
  const product = products.find((p) => p.id === productId);
  if (product) {
    const isExpress = product.productKey === 'sixteen_express';
    setConfiguration({
      product,
      mountingMethod: isExpress ? 'vehicle' : null,
      vehicleMountingType: isExpress ? 'full-conversion' : null,
      extras: [],
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        notes: '',
      },
      powerpackType: null,
      powerpackAcknowledged: false,
      powerpackRequired: !isExpress && product.productKey !== 'independent_drive_units',
    });

    setCurrentStep(isExpress ? 'extras' : 'mounting-method');
  } else {
    resetConfigurator();
  }
};

  const setMountingMethod = (method: 'trailer' | 'vehicle') => {
    if (isSixteenExpress()) {
      showJamesMayWarning('warning.sixteenExpress.noMountingNeeded');
      return;
    }

    setConfiguration((prev) => ({
      ...prev,
      mountingMethod: method,
      vehicleMountingType: method === 'trailer' ? null : prev.vehicleMountingType,
      powerpackRequired: method === 'trailer',
    }));

    setCurrentStep(method === 'trailer' ? 'powerpacks' : 'vehicle-mounting');
  };

  const setVehicleMountingType = (type: 'lay-down' | 'three-point' | 'full-conversion') => {
    if (isSixteenExpress()) {
      showJamesMayWarning('warning.sixteenExpress.hasOwnMounting');
      return;
    }

    setConfiguration((prev) => ({
      ...prev,
      vehicleMountingType: type,
      powerpackRequired: type === 'full-conversion',
    }));
    setCurrentStep('powerpacks');
  };

  const setPowerpackType = (type: string | null) => {
    if (isSixteenExpress()) {
      showJamesMayWarning('warning.sixteenExpress.noPowerpacksNeeded');
      return;
    }

    setConfiguration((prev) => ({
      ...prev,
      powerpackType: type,
    }));
  };

  const toggleExtra = (extra: string) => {
    setConfiguration((prev) => {
      const newExtras = prev.extras.includes(extra)
        ? prev.extras.filter((e) => e !== extra)
        : [...prev.extras, extra];
      return { ...prev, extras: newExtras };
    });
  };

  const setCustomerInfo = (info: Partial<ProductConfiguration['customerInfo']>) => {
    setConfiguration((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        ...info,
      },
    }));
  };

  const resetConfigurator = () => {
    setConfiguration({
      product: null,
      mountingMethod: null,
      vehicleMountingType: null,
      extras: [],
      powerpackType: null,
      powerpackAcknowledged: false,
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        notes: '',
      },
      powerpackRequired: false,
    });

    setTimeout(() => {
      setCurrentStep('product-selection');
    }, 0);
  };

  const goToStep = (step: ConfiguratorStep) => {
    if (step === 'product-selection') {
      resetConfigurator();
      return;
    }

    if (
      isSixteenExpress() &&
      step !== 'extras' &&
      step !== 'customer-info' &&
      step !== 'summary'
    ) {
      const messages = [
        t('warning.sixteenExpress.alreadyPerfect1'),
        t('warning.sixteenExpress.alreadyPerfect2'),
        t('warning.sixteenExpress.alreadyPerfect3'),
        t('warning.sixteenExpress.alreadyPerfect4'),
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      showJamesMayWarning(randomMessage);
      return;
    }

    setCurrentStep(step);
  };

  return (
    <ConfiguratorContext.Provider
      value={{
        configuration,
        currentStep,
        setProduct,
        setMountingMethod,
        setVehicleMountingType,
        toggleExtra,
        setCustomerInfo,
        goToStep,
        resetConfigurator,
        startWithProduct,
        setPowerpackType,
        setPowerpackAcknowledged: (ack: boolean) => {
          if (isSixteenExpress()) {
            showJamesMayWarning('warning.sixteenExpress.selfAcknowledging');
            return;
          }
          setConfiguration((prev) => ({
            ...prev,
            powerpackAcknowledged: ack,
          }));
        },
        powerpackRequired: configuration.powerpackRequired,
        showWarning,
      }}
    >
      {children}
    </ConfiguratorContext.Provider>
  );
};

export const useConfigurator = () => {
  const context = useContext(ConfiguratorContext);
  if (!context) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider');
  }
  return context;
};
