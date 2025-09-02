import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context';
import FormField from './FormField';


interface ContactFormProps {
    onSubmitSuccess: () => void;
}

const ContactForm = ({ onSubmitSuccess }: ContactFormProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    
    const [form, setForm] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
        dataConsent: false,
        honeypot: '',
        serialNumber: '',
        customerNumber: '',
    });
    
    const [status, setStatus] = useState<string | null>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);
    
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const subjects = [
        { id: 'general', label: t('contact_page.formular.subjects.general') },
        { id: 'product', label: t('contact_page.formular.subjects.product') },
        { id: 'support', label: t('contact_page.formular.subjects.support') },
        { id: 'service', label: t('contact_page.formular.subjects.service') },
        { id: 'distributor', label: t('contact_page.formular.subjects.distributor') },
        { id: 'parts', label: t('contact_page.formular.subjects.parts') },
        { id: 'other', label: t('contact_page.formular.subjects.other') }
    ];

    useEffect(() => {
        const shouldShowAdditionalFields = form.subject === 'parts' || form.subject === 'support';
        setShowAdditionalFields(shouldShowAdditionalFields);
        
        if (!shouldShowAdditionalFields) {
            setForm(prev => ({
                ...prev,
                serialNumber: '',
                customerNumber: ''
            }));
        }
    }, [form.subject]);

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
            serialNumber: '',
            customerNumber: '',
        });
        setShowAdditionalFields(false);
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        if (form.honeypot) {
            setStatus(t('contact_page.formular.errors.bot'));
            setIsLoading(false);
            return;
        }

        if (!recaptchaToken) {
            setStatus(t('contact_page.formular.errors.recaptcha'));
            setIsLoading(false);
            return;
        }

        if (!form.dataConsent) {
            setStatus(t('contact_page.formular.errors.consent'));
            setIsLoading(false);
            return;
        }

        if (showAdditionalFields) {
            if (!form.serialNumber.trim()) {
                setStatus(t('contact_page.formular.errors.serialNumberRequired'));
                setIsLoading(false);
                return;
            }
            if (!form.customerNumber.trim()) {
                setStatus(t('contact_page.formular.errors.customerNumberRequired'));
                setIsLoading(false);
                return;
            }
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
                serialNumber: form.serialNumber,
                customerNumber: form.customerNumber,
            };

            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT,
                templateParams,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            setStatus(t('contact_page.formular.success'));
            onSubmitSuccess();
            resetForm();
            setTimeout(() => setStatus(null), 5000);
        } catch (error) {
            console.error('Email sending failed:', error);
            setStatus(t('contact_page.formular.errors.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-sm';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${cardBgClass} p-8 rounded-xl ${shadowClass}`}
        >
            <h2 className={`text-2xl font-bold ${textClass} mb-6`}>{t('contact_page.formular.title')}</h2>
            
            <motion.form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <FormField
                    type="text"
                    name="name"
                    value={form.name}
                    label={t('contact_page.formular.name')}
                    placeholder={t('contact_page.formular.placeholders.name')}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={100}
                />

                <FormField
                    type="text"
                    name="company"
                    value={form.company}
                    label={t('contact_page.formular.company')}
                    placeholder={t('contact_page.formular.placeholders.company')}
                    onChange={handleChange}
                />

                <FormField
                    type="email"
                    name="email"
                    value={form.email}
                    label={t('contact_page.formular.email')}
                    placeholder={t('contact_page.formular.placeholders.email')}
                    onChange={handleChange}
                    required
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                />

                <FormField
                    type="tel"
                    name="phone"
                    value={form.phone}
                    label={t('contact_page.formular.phone')}
                    placeholder={t('contact_page.formular.placeholders.phone')}
                    onChange={handleChange}
                />

                <FormField
                    type="select"
                    name="subject"
                    value={form.subject}
                    label={t('contact_page.formular.subject')}
                    onChange={handleChange}
                    options={subjects}
                    required
                />

                {showAdditionalFields && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 border-l-4 border-blue-500 pl-4 ml-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg"
                    >
                        <p className={`text-sm ${textClass} font-medium mb-2`}>
                            {t('contact_page.formular.additionalFieldsNote')}
                        </p>
                        
                        <FormField
                            type="text"
                            name="serialNumber"
                            value={form.serialNumber}
                            label={t('contact_page.formular.serialNumber')}
                            placeholder={t('contact_page.formular.placeholders.serialNumber')}
                            onChange={handleChange}
                            required={showAdditionalFields}
                        />

                        <FormField
                            type="text"
                            name="customerNumber"
                            value={form.customerNumber}
                            label={t('contact_page.formular.customerNumber')}
                            placeholder={t('contact_page.formular.placeholders.customerNumber')}
                            onChange={handleChange}
                            required={showAdditionalFields}
                        />
                    </motion.div>
                )}

                <FormField
                    type="textarea"
                    name="message"
                    value={form.message}
                    label={t('contact_page.formular.message')}
                    placeholder={t('contact_page.formular.placeholders.message')}
                    onChange={handleChange}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={5}
                />

                <FormField
                    type="checkbox"
                    name="dataConsent"
                    checked={form.dataConsent}
                    label={t('contact_page.formular.consent')}
                    onChange={handleChange}
                    required
                    privacyPolicy={t('contact_page.formular.privacyPolicy')}
                />

                <input
                    type="text"
                    name="honeypot"
                    value={form.honeypot}
                    onChange={handleChange}
                    autoComplete="off"
                    tabIndex={-1}
                    style={{ display: 'none' }}
                />

                <motion.div>
                    <ReCAPTCHA
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Lc5aXcrAAAAALKHAsMMR1LUqokRWpEkgX0RVd8n"}
                        onChange={token => setRecaptchaToken(token)}
                        onExpired={() => setRecaptchaToken(null)}
                        ref={recaptchaRef}
                    />
                </motion.div>

                <motion.button
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
                            {t('contact_page.formular.sending')}
                        </>
                    ) : (
                        t('contact_page.formular.submit')
                    )}
                </motion.button>

                {status && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-center text-sm mt-2 ${status === t('contact_page.formular.success') ? 'text-green-500' : 'text-red-500'}`}
                    >
                        {status}
                    </motion.p>
                )}
            </motion.form>
        </motion.div>
    );
};

export default ContactForm;