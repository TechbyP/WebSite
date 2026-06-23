import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/context/theme-context';
import ContactForm from '../components/contactPage/ContactForm';
import CompanyInfo from '../components/contactPage/CompanyInfo';
import MapSection from '../components/contactPage/MapSection';
import FAQSection from '../components/contactPage/FAQSection';
import SuccessMessage from '../components/contactPage/SuccessMessage';
import { buildCanonicalUrl } from '../utils/seo';
import { trackAiConversion } from '../utils/publicApi';

const ContactPage = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const faqSchema = useMemo(() => {
        const faqRaw = t('contact_page.faq', { returnObjects: true }) as Record<string, unknown>;

        if (!faqRaw || typeof faqRaw !== 'object') {
            return null;
        }

        const mainEntity = Object.entries(faqRaw)
            .filter(([key, value]) => key !== 'title' && value && typeof value === 'object')
            .map(([, value]) => {
                const faqEntry = value as { question?: string; answer?: string };
                const question = faqEntry.question?.trim() || '';
                const answer = faqEntry.answer?.trim() || '';

                if (!question || !answer) {
                    return null;
                }

                return {
                    '@type': 'Question',
                    name: question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: answer,
                    },
                };
            })
            .filter((entry): entry is { '@type': 'Question'; name: string; acceptedAnswer: { '@type': 'Answer'; text: string } } => Boolean(entry));

        if (mainEntity.length === 0) {
            return null;
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity,
        };
    }, [t]);

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
                    <meta property="og:url" content={buildCanonicalUrl('/contact')} />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="TechByP" />
                    <meta property="og:image" content="/og-image.jpg" />
                    <link rel="canonical" href={buildCanonicalUrl('/contact')} />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={t('contact_page.title')} />
                    <meta name="twitter:description" content={t('contact_page.description')} />
                    {faqSchema ? <script type="application/ld+json">{JSON.stringify(faqSchema)}</script> : null}
                </Helmet>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <CompanyInfo />
                    {isSubmitted ? (
                        <SuccessMessage onReset={() => setIsSubmitted(false)} />
                    ) : (
                        <ContactForm
                            onSubmitSuccess={() => {
                                setIsSubmitted(true);
                                trackAiConversion('contact_submit');
                            }}
                        />
                    )}
                </div>

                <MapSection />
                <FAQSection />
            </div>
        </motion.div>
    );
};

export default ContactPage;