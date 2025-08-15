import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-brandgreen hover:text-brandgreen-dark"
      >
        <ArrowLeft className="mr-2" /> {t('termsOfService.back')}
      </button>

      <h1 className="text-3xl font-bold mb-6">{t('termsOfService.title')}</h1>
      <p className="mb-4">
        {t('termsOfService.intro.text1')} <strong>{t('termsOfService.intro.company')}</strong>, {t('termsOfService.intro.address')}.
      </p>

      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.1.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.1.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.2.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.2.text')}</p>
          <ul className="list-disc pl-6 mb-4">
            {t('termsOfService.sections.2.list', { returnObjects: true }).map((item, idx) => (
              <li key={idx} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.3.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.3.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.4.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.4.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.5.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.5.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.6.title')}</h2>
          <p className="mb-4">{t('termsOfService.sections.6.text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('termsOfService.sections.7.title')}</h2>
          <p>{t('termsOfService.sections.7.text')}</p>
          <p className="mt-4 text-sm text-gray-500">{t('termsOfService.sections.7.effectiveDate')}</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
