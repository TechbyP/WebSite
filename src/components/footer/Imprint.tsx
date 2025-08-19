import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/context/theme-context'; // import your hook

const Imprint = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme(); // get current theme

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-8 min-h-screen transition-colors duration-500
        ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}
      `}
    >
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center mb-6 ${
          theme === 'dark'
            ? 'text-brandgreen hover:text-brandgreen/80'
            : 'text-brandgreen hover:text-brandgreen-dark'
        }`}
      >
        <ArrowLeft className="mr-2" /> {t('back')}
      </button>
      
      <h1 className="text-3xl font-bold mb-6">{t('imprint')}</h1>
      
      <div className={`prose prose-lg ${theme === 'dark' ? 'prose-invert' : ''}`}>
        {/* Sections */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('legalDisclosure.title')}</h2>
          <p className="mb-4">{t('legalDisclosure.text')}</p>
          <address className="not-italic mb-4">
            <p className="font-bold">{t('company.name')}</p>
            <p>{t('company.address.street')}</p>
            <p>{t('company.address.zipCity')}</p>
            <p>{t('company.address.country')}</p>
          </address>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
          <ul className="space-y-2">
            <li><strong>{t('contact.phoneLabel')}</strong> {t('contact.phone')}</li>
            <li>
              <strong>{t('contact.emailLabel')}</strong> 
              <a
                href={`mailto:${t('contact.email')}`}
                className={`hover:underline ${
                  theme === 'dark' ? 'text-brandgreen' : 'text-brandgreen'
                }`}
              >
                {t('contact.email')}
              </a>
            </li>
            <li>
              <strong>{t('contact.websiteLabel')}</strong> 
              <a
                href={t('contact.website')}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline ${
                  theme === 'dark' ? 'text-brandgreen' : 'text-brandgreen'
                }`}
              >
                {t('contact.website')}
              </a>
            </li>
          </ul>
        </section>

        {/* Repeat for all other sections */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('representedBy.title')}</h2>
          <p>{t('representedBy.name')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('registerEntry.title')}</h2>
          <p>{t('registerEntry.entry')}</p>
          <p>{t('registerEntry.registerCourt')}</p>
          <p>{t('registerEntry.registrationNumber')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('vatId.title')}</h2>
          <p>{t('vatId.text')}</p>
          <p>{t('vatId.id')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('taxNumber.title')}</h2>
          <p>{t('taxNumber.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('bankDetails.title')}</h2>
          <ul className="space-y-2">
            <li><strong>{t('bankDetails.bankLabel')}</strong> {t('bankDetails.bank')}</li>
            <li><strong>{t('bankDetails.accountNoLabel')}</strong> {t('bankDetails.accountNo')}</li>
            <li><strong>{t('bankDetails.bankCodeLabel')}</strong> {t('bankDetails.bankCode')}</li>
            <li><strong>{t('bankDetails.ibanLabel')}</strong> {t('bankDetails.iban')}</li>
            <li><strong>{t('bankDetails.bicLabel')}</strong> {t('bankDetails.bic')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('responsibleContent.title')}</h2>
          <p>{t('responsibleContent.text')}</p>
          <p>{t('responsibleContent.name')}</p>
          <p>{t('responsibleContent.address.street')}</p>
          <p>{t('responsibleContent.address.zipCity')}</p>
          <p>{t('responsibleContent.address.country')}</p>
        </section>
      </div>
    </div>
  );
};

export default Imprint;
