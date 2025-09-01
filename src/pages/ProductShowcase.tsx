import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { products } from '../data/products';
import OrderNow from '../components/OrderNow';
import Sort from '../utils/ProductSorting';
import { getProductMediaFallbacks } from '../utils/DefaultPics';
import { useHeader } from './Header';
import VideoSection from '../utils/VideoSection';
import { showProductToast } from '../components/configurator/utils/ShowToastContent';
import posterImage from '../assets/pictures/hero.jpg';
import { initializeProducts } from '../data/products';
import { useTheme } from '../utils/context/theme-context'; // Import the theme context

// Custom hook for media queries
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Constants
const CATEGORIES = ["all", "smartsystems", "accessory", "manual", "Bespoke Machinery"];

const ProductShowcase = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState('');
  const { isVisible, height } = useHeader();
  const [productsRef, productsInView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  const { theme } = useTheme(); // Get current theme
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeProducts(t);
    setReady(false); // reset before init
    setTimeout(() => {
      setReady(true); // trigger re-render *after* initialization
    }, 0);
  }, [t]);

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category')?.toLowerCase();
    if (category && CATEGORIES.includes(category)) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = selectedCategory === "all"
      ? products
      : selectedCategory === "bestseller"
        ? products.filter((product) => product.bestseller)
        : products.filter(
          (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
        );

    if (sortOption) {
      const [key, order] = sortOption.split('-');

      // Handle boolean filters (electric, manual, hydraulic, bestseller)
      if (['electric', 'manual', 'hydraulic', 'bestseller'].includes(key)) {
        // First filter to only products that have this property
        filtered = filtered.filter(product => key in product);
        // Then filter to only products where the value is true
        filtered = filtered.filter(product => product[key as keyof typeof product] === true);
      }

      // Handle numeric/string sorting (price, depth, weight, magazines, date, etc.)
      if (['price', 'depth', 'weight', 'magazines', 'date', 'samplingCycleTime'].includes(key)) {
        // First filter to only products that have this property and it's not undefined
        filtered = filtered.filter(product =>
          key in product && product[key as keyof typeof product] !== undefined
        );

        // Then sort the remaining products
        filtered = [...filtered].sort((a, b) => {
          const aValue = key === 'price'
            ? parsePrice(a.price)
            : (a[key as keyof typeof a] as number) ?? 0;
          const bValue = key === 'price'
            ? parsePrice(b.price)
            : (b[key as keyof typeof b] as number) ?? 0;
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        });
      }
    }

    return filtered;
  }, [selectedCategory, sortOption, products]);

  // Helper function to parse price strings into numbers
  function parsePrice(priceStr: string) {
    const numericStr = priceStr.replace(/[^\d,.-]/g, '').replace(',', '');
    return parseFloat(numericStr) || 0;
  }

  const handleProductClick = useCallback((productId: number) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleCategoryClick = useCallback((category: string) => {
    navigate(location.pathname, {
      replace: true,
      state: {
        category,
        scrollToId: 'products'
      }
    });
    setSelectedCategory(category);
  }, [navigate, location.pathname]);
  
  if (!ready) {
    return <div className="dark:text-gray-300">{t('product.notFound')}</div>;
  }
  
  return (
    <section className="py-12 dark:bg-gray-900" ref={productsRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5">
          <h2 id="products" className="text-3xl md:text-4xl font-black leading-tight text-black dark:text-white mt-6 uppercase">
            {t('productShowcase.title')}
          </h2>
          <FadeInWhenVisible>
            <p className="text-center text-brandblue dark:text-brandgreen max-w-4xl mx-auto mb-2 text-1xl md:text-base font-black">
              {t(`productShowcase.categoryDescriptions.${selectedCategory}`)}
            </p>
          </FadeInWhenVisible>
        </div>

        {productsInView && (
          <MobileCategoryMenu
            selectedCategory={selectedCategory}
            handleCategoryClick={handleCategoryClick}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        )}

        <div
          className={`md:sticky z-30 ${theme === 'dark' ? 'dark:bg-gray-900/95' : 'bg-white/95'} transition-all duration-300`}
          style={{ top: isVisible ? `${height}px` : '0px' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-3 space-y-2 md:space-y-0">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {CATEGORIES.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 mb-5 py-2 rounded-md text-sm font-black transition-colors ${selectedCategory === category
                      ? 'bg-brandgreen text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-brandgreen dark:hover:text-brandgreen'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t(`categories.${category}`)}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center">
                <Sort sortOption={sortOption} setSortOption={setSortOption} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                handleProductClick={handleProductClick}
                setSelectedProductId={setSelectedProductId}
                setShowOrderModal={setShowOrderModal}
                sortOption={sortOption}
              />
            ))}
          </AnimatePresence>
        </div>

        <FadeInWhenVisible>
          <div id="catalog" className="text-center mt-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('productShowcase.customEquipment.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('productShowcase.customEquipment.description')}
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => navigate('/downloads')}
                    className="bg-brandgreen hover:bg-brandblue text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                  >
                    {t('productShowcase.customEquipment.viewCatalog')}
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="border border-gray-300 dark:border-gray-600 hover:border-brandblue dark:hover:border-brandgreen text-gray-700 dark:text-gray-300 hover:text-brandblue dark:hover:text-brandgreen px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                  >
                    {t('productShowcase.customEquipment.contactEngineering')}
                  </button>
                </div>
                <button
                  onClick={() => showProductToast(products)}
                  className="border border-gray-300 dark:border-gray-600 hover:border-brandblue dark:hover:border-brandgreen text-gray-700 dark:text-gray-300 hover:text-brandblue dark:hover:text-brandgreen px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-[calc(26rem+1rem)] flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {t('productShowcase.customEquipment.quickConfigure')}
                </button>
              </div>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>

      {showOrderModal && selectedProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setShowOrderModal(false);
            setSelectedProductId(null);
          }}
        >
          <div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={() => {
                setShowOrderModal(false);
                setSelectedProductId(null);
              }}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <OrderNow
              productId={selectedProductId}
              productName={products.find(p => p.id === selectedProductId)?.name || `Product ${selectedProductId}`}
              onClose={() => {
                setShowOrderModal(false);
                setSelectedProductId(null);
              }}
            />
          </div>
        </div>
      )}
      <VideoSection
        videoId='ZXNVBRUQ6cU'
        posterSizes="(max-width: 768px) 50vw, 25vw"
        posterSrcSet={posterImage}
        title={t('productShowcase.videoTitle')}
      />
    </section>
  );
};

// Memoized Components
const FadeInWhenVisible = React.memo(({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.01 });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {children}
    </motion.div>
  );
});

interface ProductCardProps {
  product: any;
  handleProductClick: (id: number) => void;
  setSelectedProductId: (id: number) => void;
  setShowOrderModal: (show: boolean) => void;
  sortOption: string;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, handleProductClick, setSelectedProductId, setShowOrderModal, sortOption }, ref) => {
    const { t } = useTranslation();
    const { heroImage, icon: IconComponent } = getProductMediaFallbacks(product);
    const [expanded, setExpanded] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { theme } = useTheme(); // Get current theme

    // Generate translation key from product name (e.g., "MP-2.60" -> "mp260")
    const productKey = useMemo(() => {
      return product.name.toLowerCase().replace(/[.-]/g, '');
    }, [product.name]);

    const handleButtonClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProductId(product.id);
        setShowOrderModal(true);
      },
      [product.id, setSelectedProductId, setShowOrderModal]
    );

    const isFilteredOut = useMemo(() => {
      const [key] = sortOption.split('-');
      return ['electric', 'manual', 'hydraulic', 'bestseller'].includes(key)
        ? !product[key as keyof typeof product]
        : false;
    }, [sortOption, product]);

    if (isMobile) {
      return (
        <motion.div
          ref={ref}
          key={product.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleProductClick(product.id)}
          className={`
            cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
            hover:shadow-md transition-all duration-300 group
            flex flex-col h-full w-full
            ${isFilteredOut ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <div className="flex flex-row">
            {/* Image on left */}
            <div className="w-1/3 relative">
              <img
                sizes="(max-width: 768px) 20vw, 150px"
                srcSet={heroImage}
                alt={product.name}
                className="w-full h-full object-cover object-[85%]"
                loading="lazy"
              />
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-brandblue dark:text-brandgreen bg-blue-100 dark:bg-gray-700 rounded-full">
                  {IconComponent && <IconComponent className="h-3 w-3 mr-0.5" />}
                  <span className="text-xs">
                    {t(`categories.${product.category.toLowerCase()}`)}
                  </span>
                </span>
              </div>
            </div>

            {/* Content on right */}
            <div className="w-2/3 p-3 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase line-clamp-1">
                    {t(`products.${productKey}.nickname`, { defaultValue: product.nickname })}
                  </h2>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  {product.price}
                </span>
              </div>

              {/* Expandable description */}
              <div className="mt-1">
                <p
                  className={`text-gray-600 dark:text-gray-300 text-xs ${expanded ? '' : 'line-clamp-2'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                >
                  {t(`products.${productKey}.description`, { defaultValue: product.description })}
                </p>
                {product.description.length > 106 && (
                  <button
                    className="text-xs text-brandblue dark:text-brandgreen mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                  >
                    {expanded ? t('productCard.showLess') : t('productCard.readMore')}
                  </button>
                )}
              </div>

              {/* Key specs (always visible) */}
              <div className="mt-2 space-y-1">
                {product.specs.slice(0, 2).map((spec: string, index: number) => (
                  <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                    <div className="w-[4px] h-[4px] bg-brandblue dark:bg-brandgreen rounded-full mr-1 flex-shrink-0"></div>
                    <span className="line-clamp-1">
                      {t(`products.${productKey}.specs.${index}`, { defaultValue: spec })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-auto pt-2 flex space-x-2">
                {product.category === "SmartSystems" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showProductToast(product);
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 border border-brandgreen text-brandgreen dark:text-brandgreen hover:bg-green-50 dark:hover:bg-gray-600 px-2 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {t('productCard.configure')}
                  </button>
                )}

                <button
                  onClick={handleButtonClick}
                  className="flex-1 bg-brandblue hover:bg-brandgreen text-white px-2 py-1.5 rounded text-xs font-bold transition-colors flex items-center justify-center"
                >
                  {t('productCard.quote')}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Default desktop version
    return (
      <motion.div
        ref={ref}
        key={product.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={() => handleProductClick(product.id)}
        className={`
          cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
          hover:shadow-xl transition-all duration-300 group hover:-translate-y-1
          flex flex-col h-full
          ${isFilteredOut ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="relative overflow-hidden">
          <img
            srcSet={heroImage}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, 480px"
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-brandblue dark:text-brandgreen bg-blue-100 dark:bg-gray-700 rounded-full">
              {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
              <span>
                {t(`categories.${product.category.toLowerCase()}`)}
              </span>
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 dark:bg-gray-700/90 px-2 py-1 rounded text-xs font-semibold text-gray-900 dark:text-white">
              {product.price}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-grow px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 uppercase">
              {t(`products.${productKey}.nickname`, { defaultValue: product.nickname })}
            </h2>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase">{product.name}</h3>
          </div>

          <div className="flex-grow flex flex-col justify-center mt-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {t(`products.${productKey}.description`, { defaultValue: product.description })}
            </p>
            <div className="space-y-2">
              {Array.isArray(product.specs) && product.specs.map((spec: string, index: number) => (
                <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-[6px] h-[6px] bg-brandblue dark:bg-brandgreen rounded-full mr-2 flex-shrink-0"></div>
                  {t(`products.${productKey}.specs.${index}`, { defaultValue: spec })}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Configure button */}
          {product.category === "SmartSystems" && (
            <button
              onClick={() => showProductToast(product)}
              className="w-full bg-white dark:bg-gray-700 border border-brandgreen text-brandgreen dark:text-brandgreen hover:bg-brandgreen hover:text-white dark:hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center group mt-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {t('productCard.quickConfigure')}
            </button>
          )}

          <div className="pt-4">
            <button
              onClick={handleButtonClick}
              className="w-full bg-brandblue hover:bg-brandgreen text-white px-3 py-2 rounded-lg text-sm font-black transition-colors flex items-center justify-center group"
            >
              {t('productCard.requestQuote')}
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
);

interface MobileCategoryMenuProps {
  selectedCategory: string;
  handleCategoryClick: (category: string) => void;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
}

const MobileCategoryMenu = React.memo(({
  selectedCategory,
  handleCategoryClick,
  sortOption,
  setSortOption,
}: MobileCategoryMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-10 left-10 z-50 p-3 rounded-full bg-brandgreen text-white shadow-lg md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('productCard.toggleMenu')}
      >
        <span className="text-xl font-bold">&#9776;</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 100, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 left-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-max max-w-l p-4 flex flex-col space-y-3 md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    handleCategoryClick(category);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md font-black text-sm transition-colors ${selectedCategory === category
                    ? 'bg-brandgreen text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:border-brandgreen hover:text-brandgreen text-gray-700 dark:text-gray-300'
                    }`}
                >
                  {t(`categories.${category}`)}
                </button>
              ))}
            </div>

            <div>
              <Sort
                sortOption={sortOption}
                setSortOption={setSortOption}
                closeMenu={() => setIsOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default React.memo(ProductShowcase);