import { useCallback } from 'react';
import { db } from '../../../firebase';
import { addDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

interface AnalyticsEvent {
  event: 'user' | 'comments' | 'club_members' | 'recent_activity';
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId: string;
}

export const useAnalytics = () => {
  const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();

  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId);
  }

  // Track event
  const trackEvent = useCallback(
    async (eventName: AnalyticsEvent['event'], metadata: Record<string, unknown> = {}, userId?: string) => {
      const eventData: AnalyticsEvent = {
        event: eventName,
        metadata,
        sessionId,
        userId,
      };

      if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, eventData);
        return;
      }

      try {
        await addDoc(collection(db, 'analytics'), {
          ...eventData,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    },
    [sessionId]
  );

  // Fetch events
  const getAnalyticsData = useCallback(async (eventName: AnalyticsEvent['event'], days = 30) => {
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

  return { trackEvent, getAnalyticsData };
};
