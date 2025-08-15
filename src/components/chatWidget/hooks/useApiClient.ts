import { useState } from 'react';
import { API_CONFIGS } from '../constants/apiConfigs';

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
};

export const useApiClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentApiIndex, setCurrentApiIndex] = useState(0);

  const sendRequest = async (messages: any[], systemMessage: any) => {
    setIsLoading(true);
    let attempts = 0;
    let result: ApiResponse = { success: false };

    while (attempts < API_CONFIGS.length) {
      const api = API_CONFIGS[currentApiIndex];
      
      try {
        const response = await fetch(api.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api.key}`,
          },
          body: JSON.stringify({
            model: api.model,
            messages: [systemMessage, ...messages],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        result = { success: true, data };
        break;
      } catch (error) {
        attempts++;
        setCurrentApiIndex((prev) => (prev + 1) % API_CONFIGS.length);
        result = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    setIsLoading(false);
    return result;
  };

  return { isLoading, sendRequest };
};
