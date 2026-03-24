import { useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui';

export const useApiKeyManager = () => {
  const { toast } = useToast();

  const handleSaveApiKey = useCallback(
    (provider: string, apiKey: string) => {
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${provider.toLowerCase()}_api_key`, apiKey);
      }

      toast({
        title: `${provider.toUpperCase()} API Key Saved`,
        description: 'Successfully updated your API key in your browser.',
      });
    },
    [toast]
  );

  useEffect(() => {
    // Check if any key is configured
    const providers = ['gemini', 'openai'];
    const hasAnyKey = providers.some(p => {
      if (typeof window !== 'undefined') {
        return !!localStorage.getItem(`${p}_api_key`);
      }
      return false;
    });

    if (!hasAnyKey) {
      toast({
        title: 'AI Configuration',
        description: 'Click the key icon to configure your Gemini or OpenAI API keys.',
        duration: 3000,
      });
    }
  }, [toast]);

  return { handleSaveApiKey };
};
