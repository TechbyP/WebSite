import ProductDetail from './ProductDetail';
import { ProductsProvider } from '../data/context/ProductsContext';

export default function ProductDetailRoute() {
  return (
    <ProductsProvider>
      <ProductDetail />
    </ProductsProvider>
  );
}