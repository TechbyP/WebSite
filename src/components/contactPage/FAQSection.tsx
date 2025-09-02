import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';

const FAQSection = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-sm';

    const faqItems = [
        {
            question: t('contact_page.faq.shipping.question'),
            answer: t('contact_page.faq.shipping.answer')
        },
        {
            question: t('contact_page.faq.training.question'),
            answer: t('contact_page.faq.training.answer')
        },
        {
            question: t('contact_page.faq.distributor.question'),
            answer: t('contact_page.faq.distributor.answer')
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
        >
            <h2 className={`text-3xl font-extrabold ${textClass} mb-8`}>{t('contact_page.faq.title')}</h2>
            <div className="space-y-4">
                {faqItems.map((item, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -3 }}
                        className={`${cardBgClass} p-6 rounded-xl ${shadowClass}`}
                    >
                        <h3 className={`text-lg font-medium ${textClass}`}>{item.question}</h3>
                        <p className={`mt-2 ${textSecondaryClass}`}>
                            {item.answer}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default FAQSection;
