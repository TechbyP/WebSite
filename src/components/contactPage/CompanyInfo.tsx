import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';
import InfoCard from './InfoCard';

const CompanyInfo = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
        >
            <motion.h1
                variants={itemVariants}
                className={`text-4xl font-extrabold ${textClass} mb-6 uppercase`}
            >
                {t('contact_page.title')}
            </motion.h1>
            <motion.p
                variants={itemVariants}
                className={`text-lg ${textSecondaryClass} mb-8`}
            >
                {t('contact_page.description')}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard
                    title={t('contact_page.address.title')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                >
                    <address className={`not-italic ${textSecondaryClass} space-y-2`}>
                        <p>{t('contact_page.address.company')}</p>
                        <p>{t('contact_page.address.street')}</p>
                        <p>{t('contact_page.address.city')}</p>
                        <p className="mt-4">
                            <a href="tel:+495431936440" className="text-blue-400 hover:text-green-400 transition-colors">
                                {t('contact_page.address.phone')}
                            </a>
                        </p>
                        <p>
                            <a href="mailto:info@bodenprobetechnik.de" className="text-blue-400 hover:text-green-400 transition-colors">
                                {t('contact_page.address.email')}
                            </a>
                        </p>
                    </address>
                </InfoCard>

                <InfoCard
                    title={t('contact_page.hours.title')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                >
                    <div className={`${textSecondaryClass} space-y-2`}>
                        <p className="flex justify-between">
                            <span>{t('contact_page.hours.weekdays')}:</span>
                            <span>{t('contact_page.hours.weekdaysTime')}</span>
                        </p>
                        <p className="flex justify-between">
                            <span>{t('contact_page.hours.friday')}:</span>
                            <span>{t('contact_page.hours.fridayTime')}</span>
                        </p>
                        <p className="mt-4 text-sm">
                            {t('contact_page.hours.closed')}
                        </p>
                    </div>
                </InfoCard>

                <InfoCard
                    title={t('contact_page.phone.title')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    }
                >
                    <p className={textSecondaryClass}>
                        {t('contact_page.phone.description')}
                    </p>
                    <div className="mt-4 space-y-1">
                        <p className={`${textClass} font-medium`}>
                            <a href="tel:+495431936440" className="hover:text-green-400 transition-colors">
                                {t('contact_page.phone.number')}
                            </a>
                        </p>
                        <p className="text-sm text-blue-400">
                            {t('contact_page.phone.supportExt')}
                        </p>
                        <p className="text-sm text-blue-400">
                            {t('contact_page.phone.salesExt')}
                        </p>
                    </div>
                </InfoCard>

                <InfoCard
                    title={t('contact_page.email.title')}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                >
                    <p className={textSecondaryClass}>
                        {t('contact_page.email.description')}
                    </p>
                    <div className="mt-4 space-y-2">
                        <p className={`${textClass} font-medium`}>
                            <a href="mailto:info@bodenprobetechnik.de" className="hover:text-green-400 transition-colors">
                                {t('contact_page.email.main')}
                            </a>
                        </p>
                        <p className="text-sm text-blue-400">
                            {t('contact_page.email.technical')}: support@bodenprobetechnik.de
                        </p>
                        <p className="text-sm text-blue-400">
                            {t('contact_page.email.sales')}: sales@bodenprobetechnik.de
                        </p>
                    </div>
                </InfoCard>
            </div>
        </motion.div>
    );
};

export default CompanyInfo;