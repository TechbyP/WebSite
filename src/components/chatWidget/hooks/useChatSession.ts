import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { firestore } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const useChatSession = (userIdentifier: string, sessionId: string) => {
  const location = useLocation();

  const saveSession = useCallback(async (chat: any[], isMobile: boolean) => {
    if (!userIdentifier || chat.length === 0) return;

    try {
      const sessionData = {
        userIdentifier,
        sessionId,
        startTime: new Date().toISOString(),
        messages: chat,
        path: location.pathname,
        messageCount: chat.length,
        isMobile,
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          viewportSize: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        },
      };

      await setDoc(doc(firestore, 'chatSessions', sessionId), sessionData);
      return true;
    } catch (error) {
      console.error('Error saving chat session:', error);
      return false;
    }
  }, [userIdentifier, sessionId, location.pathname]);

  return { saveSession };
};