import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';


const MapSection = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
    const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
    const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-sm';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardBgClass} rounded-xl ${shadowClass} overflow-hidden mb-12`}
        >
            <div className="h-96 w-full relative">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9658.018106505768!2d7.923107!3d52.668778!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDQwJzA3LjYiTiA3wrA1NScyMy4yIkU!5e0!3m2!1sen!2sde!4v1722420000000!5m2!1sen!2sde"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t('contact_page.map.title')}
                    className="absolute top-0 left-0 w-full h-full"
                ></iframe>
            </div>
            <div className="p-6">
                <h3 className={`text-xl font-bold ${textClass} mb-2`}>{t('contact_page.map.visit')}</h3>
                <p className={`${textSecondaryClass} mb-4`}>
                    {t('contact_page.map.description')}
                </p>
                <div className="flex flex-wrap gap-4">
                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href="https://www.google.com/maps?q=Bodenprobetechnik+Peters+GmbH,+Am+Fliegerhorst+11,+49610+Quakenbrück,+Germany"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-4 py-2 border ${borderClass} ${shadowClass} text-sm font-medium rounded-md ${textClass} ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {t('contact_page.map.directions')}
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
};

export default MapSection;