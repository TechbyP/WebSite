// product_default.ts
import { Wrench, ShoppingCart, FileText, Users, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Product } from '../data/types/products';

// Import your images (adjust paths based on your actual file structure)
import defaultHeroImage from '../assets/pictures/Logo-Symbol.png';
import defaultGalleryImage from '../assets/pictures/techbyp.png';

// Default fallback images and icons
const DEFAULT_HERO_IMAGE = defaultHeroImage;
const DEFAULT_GALLERY = [
  defaultGalleryImage,
  defaultGalleryImage,
  defaultGalleryImage,
  defaultGalleryImage,
];
const DEFAULT_ICON = Wrench;
const DEFAULT_HERO_VIDEO = '';

interface FallbackImages {
  heroImage: string;
  gallery: string[];
  heroVideo: string;
  icon: LucideIcon;
}

export function getProductMediaFallbacks(product: Partial<Product>): FallbackImages {
  const heroImage = product?.image ? product.image : DEFAULT_HERO_IMAGE;
  const gallery = product?.gallery?.length ? product.gallery : DEFAULT_GALLERY;
  const heroVideo = product?.heroVideo ? product.heroVideo : DEFAULT_HERO_VIDEO;
  const icon = product?.icon ? product.icon : DEFAULT_ICON;

  return {
    heroImage,
    gallery,
    heroVideo,
    icon,
  };
}

// Utility function to get category label
export function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    all: "ALL PRODUCTS",
    bestseller: "BEST-SELLING",
    manual: "HAND TOOLS",
    smartsystems: "SMART SYSTEMS",
    accessory: "SUPPORT INFRASTRUCTURE",
  };

  return categoryLabels[category.toLowerCase()] || category;
}

// Utility function to handle image error
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackImage: string) {
  const target = e.target as HTMLImageElement;
  target.src = fallbackImage;
  target.onerror = null; // Prevent infinite loop if fallback fails
  console.error('Failed to load image:', target.src);
}
export { defaultGalleryImage, defaultHeroImage };
