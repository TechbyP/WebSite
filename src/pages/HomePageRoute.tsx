import HomePage from './HomePage';
import { ProductsProvider } from '../data/context/ProductsContext';

export default function HomePageRoute() {
  return (
    <ProductsProvider>
      <HomePage />
    </ProductsProvider>
  );
}