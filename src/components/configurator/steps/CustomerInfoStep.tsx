import { motion } from 'framer-motion';
import { useConfigurator } from '../contexts/ConfiguratorContext';
import { FadeInWhenVisible } from '../../animation/FadeInWhenVisible';
import emailjs from '@emailjs/browser';
import { products } from '../../../data/products';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useTranslation } from 'react-i18next';

export const CustomerInfoStep = () => {
  const { t } = useTranslation();
  const { configuration, setCustomerInfo, goToStep, resetConfigurator } = useConfigurator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setSubmitError(t('errorsConfigurator.botDetected'));
      return;
    }

    if (!recaptchaToken) {
      setSubmitError(t('errorsConfigurator.completeRecaptcha'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const extrasNames = configuration.extras.map(extraId => {
        let extraProduct = products.find(p => p.id.toString() === extraId);
        if (!extraProduct) {
          extraProduct = products.find(p =>
            p.name.toLowerCase().replace(/\s+/g, '-') === extraId
          );
        }
        return extraProduct ? extraProduct.name : formatProductName(extraId);
      });

      const templateParams = {
        customer_name: configuration.customerInfo.name,
        customer_email: configuration.customerInfo.email,
        customer_notes: configuration.customerInfo.notes,
        product_name: configuration.product?.name || t('unknownProduct'),
        product_nickname: configuration.product?.nickname || '',
        mounting_method: configuration.mountingMethod || t('notSelected'),
        vehicle_mounting_type: configuration.vehicleMountingType || t('notApplicable'),
        selected_extras: extrasNames.length > 0
          ? extrasNames.join(', ')
          : t('noExtrasSelected'),
        total_price: calculateTotalPrice(),
        'g-recaptcha-response': recaptchaToken
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitError(t('errorsConfigurator.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitSuccess && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [submitSuccess]);

  const calculateTotalPrice = () => {
    let total = 0;

    if (configuration.product) {
      const product = products.find(p => p.id === configuration.product?.id);
      if (product && product.priceValue) {
        total += product.priceValue;
      }
    }

    if (configuration.powerpackType) {
      const powerpack = products.find(p =>
        p.id.toString() === configuration.powerpackType &&
        p.category === 'accessory' &&
        p.type === 'Powerpack'
      );
      if (powerpack && powerpack.priceValue) {
        total += powerpack.priceValue;
      }
    }

    configuration.extras.forEach(extra => {
      const extraProduct = products.find(p =>
        p.name.toLowerCase().replace(/\s+/g, '-') === extra &&
        p.category === 'accessory'
      );
      if (extraProduct && extraProduct.priceValue) {
        total += extraProduct.priceValue;
      }
    });

    if (configuration.mountingMethod === 'trailer') {
      const trailer = products.find(p =>
        p.category === 'accessory' &&
        p.type === 'Trailer'
      );
      if (trailer && trailer.priceValue) {
        total += trailer.priceValue;
      }
    } else if (configuration.vehicleMountingType) {
      const mountType = products.find(p =>
        p.name.toLowerCase().replace(/\s+/g, '-') === configuration.vehicleMountingType &&
        p.category === 'accessory'
      );
      if (mountType && mountType.priceValue) {
        total += mountType.priceValue;
      }
    }

    return `€${total.toLocaleString('de-DE')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo({ [name]: value });
  };

  const formatProductName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSelectedProducts = () => {
    const selectedProducts = [];

    if (configuration.product) {
      selectedProducts.push({
        name: configuration.product.name,
        type: 'machine'
      });
    }

    if (configuration.mountingMethod === 'trailer') {
      selectedProducts.push({
        name: t('productNames.trailerMount'),
        type: 'mounting'
      });
    } else if (configuration.vehicleMountingType) {
      const mountProduct = products.find(p =>
        p.name.toLowerCase().replace(/\s+/g, '-') === configuration.vehicleMountingType
      );
      selectedProducts.push({
        name: mountProduct ? mountProduct.name : formatProductName(configuration.vehicleMountingType),
        type: 'mounting'
      });
    }

    if (configuration.powerpackType) {
      const powerpack = products.find(p =>
        p.id.toString() === configuration.powerpackType &&
        p.category === 'accessory' &&
        p.type === 'Powerpack'
      );
      selectedProducts.push({
        name: powerpack ? powerpack.name : t('productNames.powerPack'),
        type: 'powerpack'
      });
    }

    configuration.extras.forEach(extraId => {
      let extraProduct = products.find(p => p.id.toString() === extraId);
      if (!extraProduct) {
        extraProduct = products.find(p =>
          p.name.toLowerCase().replace(/\s+/g, '-') === extraId
        );
      }

      selectedProducts.push({
        name: extraProduct ? extraProduct.name : formatProductName(extraId),
        type: 'extra'
      });
    });

    return selectedProducts;
  };

  if (submitSuccess) {
    return (
      <div ref={successRef} className="max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-brandgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('submission.successTitle')}</h3>
          <p className="text-gray-600 mb-6">{t('submission.successMessage')}</p>
          <button
            onClick={resetConfigurator}
            className="w-full bg-brandgreen hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 mb-3"
          >
            {t('submission.startNewConfig')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            {t('submission.backToHome')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6">
      <FadeInWhenVisible>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('customerInfo.title')}
          </h2>
          <p className="text-gray-500 mt-2">
            {t('customerInfo.description')}
          </p>
        </div>
      </FadeInWhenVisible>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <input
          type="text"
          name="honeypot"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          style={{ display: 'none' }}
        />

        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.fullName')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={configuration.customerInfo.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandgreen focus:border-transparent transition-all"
              placeholder={t('form.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={configuration.customerInfo.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandgreen focus:border-transparent transition-all"
              placeholder={t('form.emailPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.additionalNotes')}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={configuration.customerInfo.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brandgreen focus:border-transparent transition-all"
              placeholder={t('form.additionalNotesPlaceholder')}
            />
          </div>
        </div>

        <div className="mt-6">
          <ReCAPTCHA
            sitekey="6Lc5aXcrAAAAALKHAsMMR1LUqokRWpEkgX0RVd8n"
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
            ref={recaptchaRef}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('summary.title')}</h3>
          <ul className="divide-y divide-gray-200 text-sm text-gray-700">
            {getSelectedProducts().map((item, index) => (
              <li key={index} className="flex justify-between py-2">
                <span>{item.name}</span>
                <span>
                  {item.type === 'machine' && configuration.product?.price}
                  {item.type === 'mounting' && (
                    configuration.mountingMethod === 'trailer'
                      ? products.find(p => p.category === 'accessory' && p.type === 'Trailer')?.price || '–'
                      : products.find(p =>
                          p.name.toLowerCase().replace(/\s+/g, '-') === configuration.vehicleMountingType)?.price || '–'
                  )}
                  {item.type === 'powerpack' && products.find(p =>
                    p.id.toString() === configuration.powerpackType &&
                    p.category === 'accessory' &&
                    p.type === 'Powerpack')?.price}
                  {item.type === 'extra' && products.find(p =>
                    p.name === item.name)?.price}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-3 text-base font-bold text-brandgreen">
            <span>{t('summary.total')}</span>
            <span>{calculateTotalPrice()}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 leading-snug">
            <strong>{t('summary.pricingNoticeTitle')}</strong><br />
            {t('summary.pricingNoticeText')}
          </p>
        </div>

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-md bg-red-50 p-4 text-red-700 flex items-center space-x-2"
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
            </svg>
            <p>{submitError}</p>
          </motion.div>
        )}

        <div className="mt-10 flex justify-between">
          <button
            type="button"
            onClick={() => goToStep('extras')}
            className="flex items-center gap-2 text-gray-400 hover:text-brandgreen transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('buttonsConfigurator.back')}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !recaptchaToken}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all ${
              isSubmitting || !recaptchaToken
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brandgreen hover:bg-green-700'
            }`}
          >
            {isSubmitting ? t('buttonsConfigurator.processing') : t('buttonsConfigurator.completeOrder')}
          </button>
        </div>
      </motion.form>
    </div>
  );
};
