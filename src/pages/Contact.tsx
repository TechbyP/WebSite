import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/context/theme-context';
import ContactForm from '../components/contactPage/ContactForm';
import CompanyInfo from '../components/contactPage/CompanyInfo';
import MapSection from '../components/contactPage/MapSection';
import FAQSection from '../components/contactPage/FAQSection';
import SuccessMessage from '../components/contactPage/SuccessMessage';

const ContactPage = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`min-h-screen ${bgClass} py-12 px-4 sm:px-6 lg:px-8`}
        >
            <div className="max-w-7xl mx-auto">
                <Helmet>
                    <title>{t('contact_page.title')}</title>
                    <meta name="description" content={t('contact_page.description')} />
                    <meta name="robots" content="index, follow" />
                    <meta property="og:title" content={t('contact_page.title')} />
                    <meta property="og:description" content={t('contact_page.description')} />
                    <meta property="og:url" content={window.location.href} />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="TechByP" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={t('contact_page.title')} />
                    <meta name="twitter:description" content={t('contact_page.description')} />
                </Helmet>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <CompanyInfo />
                    {isSubmitted ? (
                        <SuccessMessage onReset={() => setIsSubmitted(false)} />
                    ) : (
                        <ContactForm onSubmitSuccess={() => setIsSubmitted(true)} />
                    )}
                </div>

                <MapSection />
                <FAQSection />
            </div>
        </motion.div>
    );
};

export default ContactPage;