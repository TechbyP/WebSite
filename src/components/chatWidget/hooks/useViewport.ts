import { useState, useEffect } from 'react';

export const useViewport = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      const newIsMobile = window.innerWidth <= 768;
      
      setIsMobile(newIsMobile);
      
      if (visualViewport) {
        setViewportHeight(visualViewport.height);
        const newKeyboardHeight = Math.max(0, window.innerHeight - visualViewport.height);
        setKeyboardHeight(newKeyboardHeight > 50 ? newKeyboardHeight : 0);
      }
    };

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      viewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isMobile, viewportHeight, keyboardHeight };
};