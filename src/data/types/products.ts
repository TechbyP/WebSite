export interface Product {
  id: number;
  date?: number;
  name?: string;
  nickname?: string;
  productKey?: string;
  category?: string;
  categoryName?: string;
  bestseller?: boolean;
  image?: string;
  heroVideo?: string;
  specs?: string[];
  icon?: any;
  description?: string;
  detailedDescription?: string | JSX.Element;
  herodescription?: string | JSX.Element;
  price?: string;
  features?: string[];
  howToUse?: string[];
  applications?: string[];
  technicalSpecs?: {
    [key: string]: string | JSX.Element;
  };
  gallery?: string[];
  testimonials?: {
    quote: string;
    author: string;
    company: string;
    rating: number;
  }[];
  priceValue?: number;
  electric?: boolean;
  manual?: boolean;
  hydraulic?: boolean;
  layers?: number;
  depth?: number;
  weight?: number | string;
  operatingVoltage?: string;
  horizons?: number;
  magazines?: number;
  samplingCycleTime?: number;
  table?: Array<{ emNo: string; articleName: string }>;
  warranty?: string;
  dimensions?: string;
  material?: string;
  type?: string;
}