import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash, search, state } = useLocation();

  useEffect(() => {
    const scrollToId = (state as { scrollToId?: string } | null)?.scrollToId
      || new URLSearchParams(search).get('id');

    if (pathname === '/' && scrollToId) {
      return;
    }

    let fallbackTimer: number | undefined;

    const scrollToTarget = () => {
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // Try smooth scroll first
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Fallback for Safari/iOS: force auto after 300ms if smooth fails
          fallbackTimer = window.setTimeout(() => {
            element.scrollIntoView({ behavior: 'auto', block: 'start' });
          }, 300);
          return;
        }
      }

      // Default: scroll page to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fallback: force auto scroll after 300ms
      fallbackTimer = window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 300);
    };

    scrollToTarget();

    return () => {
      if (fallbackTimer !== undefined) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [pathname, hash, search, state]);

  return null;
};

export default ScrollToTop;
