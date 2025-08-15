import { toast } from 'sonner';
import ProductToastContent from '../ui/ProductToast';
import { Product } from '../../../data/products';

export const showProductToast = (product: Product) => {
  toast.custom((t) => <ProductToastContent product={product} t={t} />, {
    duration: 15000,
    position: 'top-center',
  });
};
