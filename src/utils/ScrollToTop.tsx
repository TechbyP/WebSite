import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToTarget = () => {
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // Try smooth scroll first
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Fallback for Safari/iOS: force auto after 300ms if smooth fails
          setTimeout(() => element.scrollIntoView({ behavior: 'auto', block: 'start' }), 300);
          return;
        }
      }

      // Default: scroll page to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fallback: force auto scroll after 300ms
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 300);
    };

    scrollToTarget();
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
