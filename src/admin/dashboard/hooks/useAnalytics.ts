import { useEffect, useCallback } from 'react';
import { db } from '../../../firebase';
import { doc, setDoc, addDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { getDeviceInfo, getConnectionInfo } from '../browserInfo';

interface AnalyticsEvent {
  event: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
}

export const useAnalytics = () => {
  const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();

  // Initialize session if not exists
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId);
  }

  const trackEvent = useCallback(async (
    eventName: string,
    metadata: Record<string, unknown> = {},
    userId?: string
  ) => {
    const eventData: AnalyticsEvent = {
      event: eventName,
      metadata: {
        ...metadata,
        device: getDeviceInfo(),
        connection: await getConnectionInfo(),
      },
      sessionId,
      userId
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, eventData);
      return;
    }

    try {
      await addDoc(collection(db, 'analytics'), {
        ...eventData,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        path: window.location.pathname,
        referrer: document.referrer,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [sessionId]);

  // Get aggregated analytics data
  const getAnalyticsData = useCallback(async (eventName: string, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const q = query(
        collection(db, 'analytics'),
        where('event', '==', eventName),
        where('timestamp', '>=', startDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }, []);

  // Track initial page view
  useEffect(() => {
    trackEvent('page_view');
  }, [trackEvent]);

  return { trackEvent, getAnalyticsData };
};