// ProductsContext.tsx
import { createContext, useContext, useMemo } from 'react';
import { Product } from '../types/products';
import {
  createProducts,
  getProductsByCategory as filterProductsByCategory,
  getProductById as findProductById,
} from '../products';
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
  const { t, i18n } = useTranslation();

  const products = useMemo(
    () => createProducts(t),
    [t, i18n.language, i18n.resolvedLanguage]
  );

  const value = useMemo(
    () => ({
      products,
      getProductsByCategory: (category: string) => filterProductsByCategory(products, category),
      getProductById: (id: number) => findProductById(products, id),
      initialized: true,
    }),
    [products]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);