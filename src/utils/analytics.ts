import Cookies from 'js-cookie';

type ConsentValue = 'accepted' | 'rejected';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

export const COOKIE_CONSENT_NAME = 'cookie_consent';
export const ANALYTICS_CONSENT_EVENT = 'analytics-consent-changed';

const measurementId = import.meta.env.VITE_GA_KEY?.trim();
const adsId = import.meta.env.VITE_GOOGLE_ADS_ID?.trim();
const trackingIds = [measurementId, adsId].filter((value): value is string => Boolean(value));
const TRACKING_SCRIPT_ATTR = 'data-consent-analytics';
const INLINE_SCRIPT_ATTR = 'data-consent-analytics-inline';

const ensureAnalyticsStub = () => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  });

  if (!document.head.querySelector(`script[${INLINE_SCRIPT_ATTR}]`)) {
    const inlineScript = document.createElement('script');
    inlineScript.setAttribute(INLINE_SCRIPT_ATTR, 'true');
    inlineScript.text = [
      'window.dataLayer = window.dataLayer || [];',
      'window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};',
    ].join('');
    document.head.appendChild(inlineScript);
  }
};

const updateConsent = (state: 'granted' | 'denied') => {
  window.gtag?.('consent', 'update', {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
};

export const getAnalyticsConsent = (): ConsentValue | undefined => {
  const consent = Cookies.get(COOKIE_CONSENT_NAME);
  return consent === 'accepted' || consent === 'rejected' ? consent : undefined;
};

export const hasAnalyticsConsent = () => getAnalyticsConsent() === 'accepted';

export const enableAnalytics = async () => {
  if (typeof window === 'undefined') {
    return false;
  }

  ensureAnalyticsStub();

  if (trackingIds.length > 0 && !document.head.querySelector(`script[${TRACKING_SCRIPT_ATTR}]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingIds[0]}`;
    script.setAttribute(TRACKING_SCRIPT_ATTR, 'true');
    document.head.appendChild(script);

    window.gtag?.('js', new Date());
    for (const trackingId of trackingIds) {
      window.gtag?.('config', trackingId, {
        anonymize_ip: true,
        send_page_view: false,
      });
    }
  }

  updateConsent('granted');
  const { getClientAnalytics } = await import('../firebase');
  await getClientAnalytics();
  return true;
};

export const disableAnalytics = () => {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  updateConsent('denied');
};

export const setAnalyticsConsent = (value: ConsentValue) => {
  Cookies.set(COOKIE_CONSENT_NAME, value, { expires: 365 });

  if (value === 'accepted') {
    void enableAnalytics();
  } else {
    disableAnalytics();
  }

  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
};

export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (!hasAnalyticsConsent() || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};