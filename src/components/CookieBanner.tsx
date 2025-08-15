import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { X, Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COOKIE_CONSENT_NAME = 'cookie_consent';
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
    Cookies.set(COOKIE_CONSENT_NAME, 'accepted', { expires: 365 });
    setIsVisible(false);
    loadGoogleAnalytics();
  };

  const rejectCookies = () => {
    Cookies.set(COOKIE_CONSENT_NAME, 'rejected', { expires: 365 });
    setIsVisible(false);
  };

  const loadGoogleAnalytics = () => {
    if ((window as any).gtag) return;
    const GA_KEY = import.meta.env.VITE_GA_KEY;
    if (!GA_KEY) return console.warn('Google Analytics key missing');

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_KEY}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_KEY}');
    `;
    document.head.appendChild(script2);
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
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
