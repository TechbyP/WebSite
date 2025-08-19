import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import emailjs from '@emailjs/browser';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
        dataConsent: false,
        honeypot: '',
    });

    const [status, setStatus] = useState<string | null>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const subjects = [
        { id: 'general', label: t('formular.subjects.general') },
        { id: 'product', label: t('formular.subjects.product') },
        { id: 'support', label: t('formular.subjects.support') },
        { id: 'service', label: t('formular.subjects.service') },
        { id: 'distributor', label: t('formular.subjects.distributor') },
        { id: 'parts', label: t('formular.subjects.parts') },
        { id: 'other', label: t('formular.subjects.other') }
    ];

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target as HTMLInputElement;
            const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

            setForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        },
        []
    );

    const resetForm = useCallback(() => {
        setForm({
            name: '',
            company: '',
            email: '',
            phone: '',
            subject: 'general',
            message: '',
            dataConsent: false,
            honeypot: '',
        });
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Bot check
        if (form.honeypot) {
            setStatus(t('formular.errors.bot'));
            setIsLoading(false);
            return;
        }

        if (!recaptchaToken) {
            setStatus(t('formular.errors.recaptcha'));
            setIsLoading(false);
            return;
        }

        if (!form.dataConsent) {
            setStatus(t('formular.errors.consent'));
            setIsLoading(false);
            return;
        }

        try {
            const selectedSubject = subjects.find(s => s.id === form.subject)?.label || form.subject;

            const templateParams = {
                name: form.name,
                company: form.company,
                email: form.email,
                phone: form.phone,
                subject: selectedSubject,
                message: form.message,
                'g-recaptcha-response': recaptchaToken,
            };

            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT,
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setStatus(t('formular.success'));
            setIsSubmitted(true);
            resetForm();

            setTimeout(() => setStatus(null), 5000);
        } catch (error) {
            console.error('Email sending failed:', error);
            setStatus(t('formular.errors.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants
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

    const cardVariants = {
        hover: {
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };
    const combinedVariants = {
        hidden: itemVariants.hidden,
        visible: itemVariants.visible,
        hover: cardVariants.hover
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                <Helmet>
                    <title>{t('meta.title')}</title>
                    <meta name="description" content={t('meta.description')} />
                    <meta name="robots" content="index, follow" />
                    <meta property="og:title" content={t('meta.ogTitle')} />
                    <meta property="og:description" content={t('meta.ogDescription')} />
                    <meta property="og:url" content={t('meta.ogUrl')} />
                    <meta property="og:type" content="website" />
                    <meta property="og:site_name" content="TechByP" />
                    <meta property="og:image" content={t('meta.ogImage')} />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={t('meta.twitterTitle')} />
                    <meta name="twitter:description" content={t('meta.twitterDescription')} />
                </Helmet>

                {/* Company Info Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
                >
                    <div className="lg:col-span-2">
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-extrabold text-gray-900 mb-6 uppercase"
                        >
                            {t('title')}
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-gray-600 mb-8"
                        >
                            {t('description')}
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                variants={combinedVariants}
                                whileHover="hover"
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('address.title')}</h3>
                                <address className="not-italic text-gray-600 space-y-2">
                                    <p>{t('address.company')}</p>
                                    <p>{t('address.street')}</p>
                                    <p>{t('address.city')}</p>
                                    <p className="mt-4">
                                        <a href="tel:+495431936440" className="text-blue-600 hover:text-green-600 transition-colors">
                                            {t('address.phone')}
                                        </a>
                                    </p>
                                    <p>
                                        <a href="mailto:info@bodenprobetechnik.de" className="text-blue-600 hover:text-green-600 transition-colors">
                                            {t('address.email')}
                                        </a>
                                    </p>
                                </address>
                            </motion.div>

                            <motion.div
                                variants={combinedVariants}
                                whileHover="hover"
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('hours.title')}</h3>
                                <div className="text-gray-600 space-y-2">
                                    <p className="flex justify-between">
                                        <span>{t('hours.weekdays')}:</span>
                                        <span>{t('hours.weekdaysTime')}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>{t('hours.friday')}:</span>
                                        <span>{t('hours.fridayTime')}</span>
                                    </p>
                                    <p className="mt-4 text-sm">
                                        {t('hours.closed')}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={combinedVariants}
                                whileHover="hover"
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <div className="flex items-center mb-4">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="p-3 rounded-full bg-blue-100 text-blue-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </motion.div>
                                    <h3 className="ml-3 text-xl font-bold text-gray-800">{t('phone.title')}</h3>
                                </div>
                                <p className="text-gray-600">
                                    {t('phone.description')}
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-gray-800 font-medium">
                                        <a href="tel:+495431936440" className="hover:text-green-600 transition-colors">
                                            {t('phone.number')}
                                        </a>
                                    </p>
                                    {/* <p className="text-sm text-gray-500">{t('phone.supportExt')}</p>
                                    <p className="text-sm text-gray-500">{t('phone.salesExt')}</p> */}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={combinedVariants}
                                whileHover="hover"
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                <div className="flex items-center mb-4">
                                    <motion.div
                                        whileHover={{ rotate: 10 }}
                                        className="p-3 rounded-full bg-blue-100 text-blue-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </motion.div>
                                    <h3 className="ml-3 text-xl font-bold text-gray-800">{t('email.title')}</h3>
                                </div>
                                <p className="text-gray-600">
                                    {t('email.description')}
                                </p>
                                <div className="mt-4 space-y-1">
                                    <p className="text-gray-800 font-medium">
                                        <a href="mailto:info@bodenprobetechnik.de" className="hover:text-green-600 transition-colors">
                                            {t('email.main')}
                                        </a>
                                    </p>
                                    {/* <p className="text-sm text-gray-500">
                                        {t('email.technical')}: <a href="mailto:support@bodenprobetechnik.de" className="hover:text-green-600 transition-colors">support@bodenprobetechnik.de</a>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('email.sales')}: <a href="mailto:sales@bodenprobetechnik.de" className="hover:text-green-600 transition-colors">sales@bodenprobetechnik.de</a>
                                    </p> */}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-8 rounded-xl shadow-md"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('formular.title')}</h2>

                        <AnimatePresence mode="wait">
                            {isSubmitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-8"
                                >
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
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('formular.successTitle')}</h3>
                                    <p className="mt-2 text-gray-600">
                                        {t('formular.successMessage')}
                                    </p>
                                    <motion.button
                                        onClick={() => setIsSubmitted(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all"
                                    >
                                        {t('formular.anotherMessage')}
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    ref={formRef}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            value={form.name}
                                            placeholder={t('formular.placeholders.name')}
                                            onChange={handleChange}
                                            required
                                            minLength={2}
                                            maxLength={100}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.company')}
                                        </label>
                                        <input
                                            id="company"
                                            name="company"
                                            value={form.company}
                                            placeholder={t('formular.placeholders.company')}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.email')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            placeholder={t('formular.placeholders.email')}
                                            onChange={handleChange}
                                            required
                                            pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.phone')}
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={form.phone}
                                            placeholder={t('formular.placeholders.phone')}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.subject')} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={form.subject}

                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        >
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>{subject.label}</option>
                                            ))}
                                        </select>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('formular.message')} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={form.message}
                                            placeholder={t('formular.placeholders.message')}
                                            onChange={handleChange}
                                            required
                                            minLength={10}
                                            maxLength={1000}
                                            rows={5}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="dataConsent"
                                                name="dataConsent"
                                                type="checkbox"
                                                checked={form.dataConsent}
                                                onChange={handleChange}
                                                required
                                                className="focus:ring-blue-600 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="dataConsent" className="font-medium text-gray-700">
                                                {t('formular.consent')}{' '}
                                                <a href="/privacy" className="text-blue-600 hover:text-green-600 underline transition-colors">
                                                    {t('formular.privacyPolicy')}
                                                </a>
                                                . <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                    </motion.div>

                                    {/* Honeypot field */}
                                    <input
                                        type="text"
                                        name="honeypot"
                                        value={form.honeypot}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        tabIndex={-1}
                                        style={{ display: 'none' }}
                                    />

                                    <motion.div variants={itemVariants}>
                                        <ReCAPTCHA
                                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Lc5aXcrAAAAALKHAsMMR1LUqokRWpEkgX0RVd8n"}
                                            onChange={token => setRecaptchaToken(token)}
                                            onExpired={() => setRecaptchaToken(null)}
                                            ref={recaptchaRef}
                                        />
                                    </motion.div>

                                    <motion.button
                                        variants={itemVariants}
                                        type="submit"
                                        disabled={!recaptchaToken || !form.dataConsent || isLoading}
                                        whileHover={(!recaptchaToken || !form.dataConsent || isLoading) ? {} : { scale: 1.02 }}
                                        whileTap={(!recaptchaToken || !form.dataConsent || isLoading) ? {} : { scale: 0.98 }}
                                        className="w-full bg-blue-600 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {t('formular.sending')}
                                            </>
                                        ) : (
                                            t('formular.submit')
                                        )}
                                    </motion.button>

                                    {status && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`text-center text-sm mt-2 ${status === t('formular.success') ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {status}
                                        </motion.p>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Map Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
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
                            title={t('map.title')}
                            className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('map.visit')}</h3>
                        <p className="text-gray-600 mb-4">
                            {t('map.description')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href="https://www.google.com/maps?q=Bodenprobetechnik+Peters+GmbH,+Am+Fliegerhorst+11,+49610+Quakenbrück,+Germany"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
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
                                {t('map.directions')}
                            </motion.a>
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    variants={itemVariants}
                    className="mt-16"
                >
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t('faq.title')}</h2>
                    <div className="space-y-4">
                        <motion.div
                            whileHover={{ y: -3 }}
                            className="bg-white p-6 rounded-xl shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-gray-900">{t('faq.shipping.question')}</h3>
                            <p className="mt-2 text-gray-600">
                                {t('faq.shipping.answer')}
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -3 }}
                            className="bg-white p-6 rounded-xl shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-gray-900">{t('faq.training.question')}</h3>
                            <p className="mt-2 text-gray-600">
                                {t('faq.training.answer')}
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -3 }}
                            className="bg-white p-6 rounded-xl shadow-sm"
                        >
                            <h3 className="text-lg font-medium text-gray-900">{t('faq.distributor.question')}</h3>
                            <p className="mt-2 text-gray-600">
                                {t('faq.distributor.answer')}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ContactPage;