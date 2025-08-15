import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-brandgreen hover:text-brandgreen-dark"
      >
        <ArrowLeft className="mr-2" /> {t('privacy.back')}
      </button>
      
      <h1 className="text-3xl font-bold mb-6">{t('privacy.title')}</h1>
      
      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.introduction.title')}</h2>
          <p className="mb-4">{t('privacy.introduction.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.dataCollection.title')}</h2>
          <p className="mb-4">{t('privacy.dataCollection.text')}</p>
          <ul className="list-disc pl-6 mb-4">
            {t('privacy.dataCollection.items', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.useOfData.title')}</h2>
          <p className="mb-4">{t('privacy.useOfData.text')}</p>
          <ul className="list-disc pl-6 mb-4">
            {t('privacy.useOfData.items', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i} className="mb-2">{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.dataProtection.title')}</h2>
          <p className="mb-4">{t('privacy.dataProtection.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.thirdParty.title')}</h2>
          <p className="mb-4">{t('privacy.thirdParty.text')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.cookies.title')}</h2>
          <p className="mb-4">{t('privacy.cookies.text')}</p>
          <ul className="list-disc pl-6 mb-4">
            {t('privacy.cookies.items', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i} className="mb-2">{item}</li>
            ))}
          </ul>
          <p>{t('privacy.cookies.manageText')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.rights.title')}</h2>
          <p className="mb-4">{t('privacy.rights.text')}</p>
          <ul className="list-disc pl-6 mb-4">
            {t('privacy.rights.items', { returnObjects: true }).map((item: string, i: number) => (
              <li key={i} className="mb-2">{item}</li>
            ))}
          </ul>
          <p>{t('privacy.rights.contact')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('privacy.changes.title')}</h2>
          <p>{t('privacy.changes.text')}</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
