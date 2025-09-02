import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';

interface SuccessMessageProps {
    onReset: () => void;
}

const SuccessMessage = ({ onReset }: SuccessMessageProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-sm';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${cardBgClass} p-8 rounded-xl ${shadowClass}`}
        >
            <div className="text-center py-8">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>
                <h3 className={`mt-4 text-lg font-medium ${textClass}`}>{t('contact_page.formular.successTitle')}</h3>
                <p className={`mt-2 ${textSecondaryClass}`}>
                    {t('contact_page.formular.successMessage')}
                </p>
                <motion.button
                    onClick={onReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all"
                >
                    {t('contact_page.formular.anotherMessage')}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default SuccessMessage;