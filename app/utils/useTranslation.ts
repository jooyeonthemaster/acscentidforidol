import { useState, useCallback } from 'react';

export interface TranslationResult {
  translatedText?: string;
  translatedTexts?: string[];
  detectedLanguage?: string;
  languages?: any[];
  originalText?: string;
  originalTexts?: string[];
  targetLanguage?: string;
}

export interface TranslationError {
  message: string;
  type: 'quota_exceeded' | 'auth_error' | 'translation_error' | 'network_error';
  details?: string;
}

export function useTranslation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const translate = useCallback(async (
    text: string, 
    targetLanguage: string = 'en'
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          targetLanguage, 
          action: 'translate' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '번역 요청에 실패했습니다.');
      }

      const result: TranslationResult = await response.json();
      return result.translatedText || null;
    } catch (err: any) {
      const translationError: TranslationError = {
        message: err.message || '번역 중 오류가 발생했습니다.',
        type: 'network_error'
      };
      setError(translationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateMultiple = useCallback(async (
    texts: string[], 
    targetLanguage: string = 'en'
  ): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          texts, 
          targetLanguage, 
          action: 'translate' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '다중 번역 요청에 실패했습니다.');
      }

      const result: TranslationResult = await response.json();
      return result.translatedTexts || null;
    } catch (err: any) {
      const translationError: TranslationError = {
        message: err.message || '다중 번역 중 오류가 발생했습니다.',
        type: 'network_error'
      };
      setError(translationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLanguage = useCallback(async (text: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          action: 'detect' 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '언어 감지 요청에 실패했습니다.');
      }

      const result: TranslationResult = await response.json();
      return result.detectedLanguage || null;
    } catch (err: any) {
      const translationError: TranslationError = {
        message: err.message || '언어 감지 중 오류가 발생했습니다.',
        type: 'network_error'
      };
      setError(translationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSupportedLanguages = useCallback(async (): Promise<any[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'languages' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '지원 언어 조회 요청에 실패했습니다.');
      }

      const result: TranslationResult = await response.json();
      return result.languages || null;
    } catch (err: any) {
      const translationError: TranslationError = {
        message: err.message || '지원 언어 조회 중 오류가 발생했습니다.',
        type: 'network_error'
      };
      setError(translationError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    translate, 
    translateMultiple,
    detectLanguage,
    getSupportedLanguages,
    isLoading, 
    error,
    clearError
  };
}