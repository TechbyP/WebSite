import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const scrollToTarget = () => {
      if (hash) {
        // Try to find the element by ID from the hash
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      // Default scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // If page is already loaded, scroll immediately; otherwise wait for 'load' event
    if (document.readyState === 'complete') {
      scrollToTarget();
    } else {
      window.addEventListener('load', scrollToTarget);
      return () => window.removeEventListener('load', scrollToTarget);
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
