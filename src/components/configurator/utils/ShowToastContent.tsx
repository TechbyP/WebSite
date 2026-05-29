import { toast } from 'sonner';
import ProductToastContent from '../ui/ProductToast';
import type { Product } from '../../../data/types/products';

export const showProductToast = (product: Product) => {
  toast.custom((t) => <ProductToastContent product={product} t={t} />, {
    duration: 15000,
    position: 'top-center',
  });
};
