import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { X, Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COOKIE_CONSENT_NAME, setAnalyticsConsent } from '../utils/analytics';

type ConsentValue = 'accepted' | 'rejected';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const consent = Cookies.get(COOKIE_CONSENT_NAME) as ConsentValue | undefined;
    if (!consent) setIsVisible(true);
    else setIsVisible(false);
  }, []);

  const acceptCookies = () => {
    setAnalyticsConsent('accepted');
    setIsVisible(false);
  };

  const rejectCookies = () => {
    setAnalyticsConsent('rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cookie className="h-5 w-5 text-blue-400" />
          <div className="flex-1">
            <p className="text-sm">
              {t('cookie.message')}{' '}
              <button
                onClick={() => navigate('/privacy')}
                className="text-blue-400 hover:text-blue-300 ml-1 underline"
              >
                {t('cookie.learnMore')}
              </button>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={acceptCookies}
            className="bg-brandgreen/50 hover:bg-brandgreen px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t('cookie.accept')}
          </button>
          <button
            onClick={rejectCookies}
            className="text-gray-300 hover:text-white p-1"
            title={t('cookie.reject')}
            aria-label={t('cookie.reject')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
