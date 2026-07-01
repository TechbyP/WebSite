import type { Product } from '../../../data/types/products';

export interface ProductConfiguration {
  product: Product | null;
  mountingMethod: 'trailer' | 'vehicle' | null;
  vehicleMountingType: 'lay-down' | 'three-point' | 'full-conversion' | null;
  powerpackType: string | null;
  powerpackAcknowledged: boolean;
  powerpackRequired: boolean;
  extras: string[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
}

export type ConfiguratorStep =
  | 'product-selection'
  | 'mounting-method'
  | 'vehicle-mounting'
  | 'powerpacks'
  | 'extras'
  | 'customer-info'
  | 'summary';

