// src/utils/activityLogger.ts
import { db } from '../firebase'; // adjust path to your firebase config
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

export const logActivity = async ({
  event,
  userEmail,
  userId,
  metadata
}: {
  event: string;
  userEmail?: string;
  userId?: string;
  metadata?: any;
}) => {
  try {
    await setDoc(doc(collection(db, 'analytics')), {
      event,
      timestamp: serverTimestamp(),
      userEmail: userEmail || 'System',
      userId: userId || null,
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
