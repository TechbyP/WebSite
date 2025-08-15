import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import newsletter from '../assets/pictures/newsletter.jpg';
import { useTranslation } from 'react-i18next';

const TechByPClubModal = () => {
  const { t } = useTranslation();

  const [modalEmail, setModalEmail] = useState('');
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');
  const [footerIsLoading, setFooterIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('techbyp_modal_seen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(modalEmail)) {
      toast.error(t('modal.invalidEmail'));
      return;
    }
    setModalIsLoading(true);
    try {
      await addDoc(collection(db, 'club_members'), {
        email: modalEmail,
        timestamp: new Date(),
        source: 'modal_signup',
      });
      toast.dismiss();
      toast.success(t('modal.success'));
      localStorage.setItem('techbyp_modal_seen', new Date().toISOString());
      setIsOpen(false);
      setModalEmail('');
    } catch {
      toast.error(t('modal.error'));
    } finally {
      setModalIsLoading(false);
    }
  };

  const handleSubmitFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(footerEmail)) {
      toast.error(t('footer.invalidEmail'));
      return;
    }
    setFooterIsLoading(true);
    try {
      await addDoc(collection(db, 'club_members'), {
        email: footerEmail,
        timestamp: new Date(),
        source: 'footer_signup',
      });
      toast.dismiss();
      toast.success(t('footer.success'));
      setFooterEmail('');
    } catch {
      toast.error(t('footer.error'));
    } finally {
      setFooterIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('techbyp_modal_seen', new Date().toISOString());
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full flex overflow-hidden font-sans"
            >
              {/* Left image */}
              <div className="hidden md:block md:w-1/2">
                <img
                  sizes="(max-width: 768px) 50vw, 25vw"
srcSet={newsletter}
                  alt={t('modal.imageAlt')}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Right content */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
                  aria-label={t('modal.closeLabel')}
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-black uppercase text-gray-900 mb-3 leading-tight">
                    {t('modal.title')}
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {t('modal.description')}
                  </p>
                </div>

                <form onSubmit={handleSubmitModal} className="space-y-4">
                  <input
                    type="email"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    placeholder={t('modal.placeholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />

                  <button
                    type="submit"
                    disabled={modalIsLoading}
                    className="w-full bg-brandgreen hover:bg-brandblue text-white py-3 rounded-lg font-black transition-colors flex items-center justify-center"
                  >
                    {modalIsLoading ? t('modal.loading') : t('modal.button')}
                  </button>

                  <p className="text-xs text-gray-500 text-center leading-snug">
                    {t('modal.note')}
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer version (uncomment if needed) */}
      {/* 
      <div className="mt-8 p-6 bg-gray-50 rounded-lg font-sans max-w-md mx-auto">
        <div className="text-center">
          <h4 className="text-xl font-black uppercase mb-2 text-gray-900 leading-snug">
            {t('footer.title')}
          </h4>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">
            {t('footer.description')}
          </p>
          <form onSubmit={handleSubmitFooter} className="flex gap-2">
            <input
              type="email"
              value={footerEmail}
              onChange={(e) => setFooterEmail(e.target.value)}
              placeholder={t('footer.placeholder')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              disabled={footerIsLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              {footerIsLoading ? '...' : t('footer.button')}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 leading-snug">
            {t('footer.note')}
          </p>
        </div>
      </div> 
      */}
    </>
  );
};

export default TechByPClubModal;
