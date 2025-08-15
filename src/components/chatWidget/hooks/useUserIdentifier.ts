import { useState, useEffect } from 'react';

export const useUserIdentifier = (storageKey: string) => {
  const [userIdentifier, setUserIdentifier] = useState<string>('');

  useEffect(() => {
    const storedIdentifier = localStorage.getItem(storageKey);
    if (!storedIdentifier) {
      const newIdentifier = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(storageKey, newIdentifier);
      setUserIdentifier(newIdentifier);
    } else {
      setUserIdentifier(storedIdentifier);
    }
  }, [storageKey]);

  return userIdentifier;
};