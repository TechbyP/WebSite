// Navigate button to mentioned product in ChatWidget

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../data/context/ProductsContext';

interface Props {
  content: string;
}

export const ProductButton = React.memo(({ content }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { products } = useProducts();
  const normalizedContent = content.toLowerCase();

  const matchedProducts = React.useMemo(() => {
    return products.filter((product) =>
      (product.name && normalizedContent.includes(product.name.toLowerCase())) ||
      (product.nickname && normalizedContent.includes(product.nickname.toLowerCase()))
    );
  }, [normalizedContent, products]);

  if (matchedProducts.length === 0) return null;

  const productPageMatch = location.pathname.match(/^\/product\/(\d+)/);
  const currentProductId = productPageMatch ? productPageMatch[1] : null;

  const productsToShow = matchedProducts.filter(
    product => !(currentProductId && currentProductId === product.id.toString())
  );

  if (productsToShow.length === 0) return null;

  const navigateToProduct = (productId: number) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle FAB */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-4 right-4 z-50 bg-brandblue text-white text-sm px-4 py-2 rounded-full shadow-lg hover:bg-brandgreen transition md:hidden"
      >
        {isOpen ? 'Close' : 'View Products'}
      </button>

      {/* Slide-Up Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 md:static md:mt-2 md:border-none md:bg-transparent md:shadow-none md:dark:bg-transparent ${
          isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
        }`}
      >
        <div className="flex flex-col items-start gap-2 p-4 md:p-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">Mentioned products:</span>
          {productsToShow.map(product => (
            <button
              key={product.id}
              onClick={() => navigateToProduct(product.id)}
              className="text-xs text-brandblue underline transition-colors hover:text-brandgreen dark:text-brandgreen dark:hover:text-brandblue"
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
});
