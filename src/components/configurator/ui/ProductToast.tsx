import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product } from '../../../data/products';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getProductMediaFallbacks,
  handleImageError,
  defaultHeroImage,
} from '../../../utils/DefaultPics';
import { useTranslation } from 'react-i18next';

const ProductToastContent = ({ product, t }: { product: Product; t: any }) => {
  const { startWithProduct } = useConfigurator();
  const navigate = useNavigate();
  const { t: translate } = useTranslation();

  const handleConfigure = () => {
    startWithProduct(product.id);
    toast.dismiss(t.id);
    navigate('/configurator');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full flex overflow-hidden font-sans border border-gray-200 dark:border-gray-700"
    >
      {/* Image Section */}
      <div className="hidden md:block md:w-1/2">
        <img
          sizes="(max-width: 768px) 50vw, 25vw"
          srcSet={getProductMediaFallbacks(product).heroImage}
          alt={product.name}
          onError={(e) => handleImageError(e, defaultHeroImage)}
          className="h-full w-full object-cover object-[85%]"
        />
      </div>

      {/* Content Section */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center relative">
        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={translate('configurator.productToast.close')}
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Product Info */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {product.nickname}
          </p>
        </div>

        {/* Description */}
        <div className="text-gray-700 dark:text-gray-300 text-sm space-y-3 leading-snug">
          <p>{translate('configurator.productToast.desc1')}</p>
          <p>
            {translate('configurator.productToast.desc2.part1')}{' '}
            <strong>
              {product.name ||
                translate('configurator.productToast.machine')}
            </strong>{' '}
            {translate('configurator.productToast.desc2.part2')}
          </p>
          <p>{translate('configurator.productToast.desc3')}</p>
        </div>

        {/* Call to Action */}
        <button
          onClick={handleConfigure}
          className="mt-6 bg-brandgreen hover:bg-brandblue text-white py-3 px-6 rounded-lg font-bold transition-all shadow-md w-full text-center"
        >
          {translate('configurator.productToast.configure', {
            productName:
              product.name || translate('configurator.productToast.machine'),
          })}{' '}
          →
        </button>
      </div>
    </motion.div>
  );
};

export default ProductToastContent;
