// ProductsContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types/products';
import { initializeProducts, getProductsByCategory, getProductById } from '../products';
import { useTranslation } from 'react-i18next';

const ProductsContext = createContext<{
  products: Product[];
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: number) => Product | undefined;
  initialized: boolean;
}>({
  products: [],
  getProductsByCategory: () => [],
  getProductById: () => undefined,
  initialized: false,
});

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    initializeProducts(t);
    setProducts(products); // This will use the exported products array
    setInitialized(true);
  }, [t]);

  const value = {
    products,
    getProductsByCategory,
    getProductById,
    initialized
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);