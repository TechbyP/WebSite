import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

interface OrderNowProps {
  onClose: () => void;
  productId: string;
  productName?: string;
}

const OrderNow = ({ onClose, productId, productName }: OrderNowProps) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.honeypot) {
      setStatus(t('orderNow.botDetected'));
      return;
    }
    if (!recaptchaToken) {
      setStatus(t('orderNow.completeRecaptcha'));
      return;
    }

    try {
      const referenceNumber = `REF-${Date.now().toString().slice(-8)}`;
      const currentDate = new Date().toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const templateParams = {
        customer_name: form.name,
        customer_email: form.email,
        customer_notes: form.message,
        date: currentDate,
        reference_number: referenceNumber,
        product_name: productName || `${t('orderNow.product')} ${productId}`,
        product_id: productId,
        'g-recaptcha-response': recaptchaToken,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus(t('orderNow.success'));
      setForm({ name: '', email: '', message: '', honeypot: '' });
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Email sending failed:', error);
      setStatus(t('orderNow.fail'));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div
          ref={modalRef}
          className="relative bg-white rounded-xl max-w-md w-full mx-auto p-6 overflow-y-auto max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={t('orderNow.close')}
          >
            ✕
          </button>

          <h2 className="mt-5 text-2xl sm:text-3xl font-black text-center text-gray-900 mb-6 uppercase tracking-wide">
            {t('orderNow.title')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t('orderNow.placeholderName')}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandblue focus:outline-none transition-all"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t('orderNow.placeholderEmail')}
              required
              pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandblue focus:outline-none transition-all"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder={t('orderNow.placeholderMessage')}
              required
              minLength={10}
              maxLength={1000}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brandblue focus:outline-none transition-all"
            />

            {/* Honeypot */}
            <input
              type="text"
              name="honeypot"
              value={form.honeypot}
              onChange={handleChange}
              autoComplete="off"
              tabIndex={-1}
              style={{ display: 'none' }}
            />

            <ReCAPTCHA
              sitekey="6Lc5aXcrAAAAALKHAsMMR1LUqokRWpEkgX0RVd8n"
              onChange={token => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              ref={recaptchaRef}
            />

            <button
              type="submit"
              disabled={!recaptchaToken}
              className="w-full bg-brandblue hover:bg-brandgreen text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('orderNow.submit')}
            </button>

            {status && (
              <p
                className={`text-center text-sm mt-2 ${
                  status.includes(t('orderNow.success'))
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderNow;
