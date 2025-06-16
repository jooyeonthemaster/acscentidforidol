'use client';

import React, { useState, useEffect } from 'react';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

const LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-cn', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const GlobalLanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, isTranslating } = useTranslationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handleBeforePrint = () => {
      setIsPrinting(true);
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // 프린트 중이면 아예 렌더링하지 않음
  if (isPrinting) {
    return null;
  }

  const handleLanguageSelect = async (languageCode: string) => {
    setIsOpen(false);
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 print:hidden global-language-selector">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isTranslating}
          className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          <span className="text-lg">{selectedLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700">
            {selectedLanguage.name}
          </span>
          {isTranslating ? (
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl z-60 overflow-hidden">
            <div className="py-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                    currentLanguage === language.code ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-base">{language.flag}</span>
                  <span className="font-medium flex-1">{language.name}</span>
                  {currentLanguage === language.code && (
                    <span className="text-pink-500">✓</span>
                  )}
                </button>
              ))}
            </div>
            
            {isTranslating && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-600">번역 중...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GlobalLanguageSelector; 