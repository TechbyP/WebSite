import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { firestore } from '../../../firebase';
import { collection, addDoc } from 'firebase/firestore';

type EventData = Record<string, any>;

export const useChatAnalytics = (userIdentifier: string) => {
  const location = useLocation();

  const logEvent = useCallback(async (eventType: string, data: EventData = {}) => {
    if (!userIdentifier) return;

    try {
      const eventData = {
        timestamp: new Date().toISOString(),
        userIdentifier,
        eventType,
        currentPath: location.pathname,
        ...data,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          viewportWidth: document.documentElement.clientWidth,
          viewportHeight: document.documentElement.clientHeight,
          pixelRatio: window.devicePixelRatio,
        },
      };

      await addDoc(collection(firestore, 'chatAnalytics'), eventData);
    } catch (error) {
      console.error('Error logging analytics event:', error);
      // Optional: fallback to local storage or another logging service
    }
  }, [userIdentifier, location.pathname]);

  return { logEvent };
};