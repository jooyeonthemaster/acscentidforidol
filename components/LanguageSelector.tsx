'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/utils/useTranslation';

interface LanguageSelectorProps {
  onLanguageChange: (languageCode: string) => void;
  currentLanguage?: string;
  className?: string;
}

const POPULAR_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-cn', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
  currentLanguage = 'ko',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allLanguages, setAllLanguages] = useState<any[]>([]);
  const { getSupportedLanguages, isLoading, error } = useTranslation();

  const selectedLanguage = POPULAR_LANGUAGES.find(lang => lang.code === currentLanguage) 
    || { code: currentLanguage, name: currentLanguage.toUpperCase(), flag: '🌐' };

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await getSupportedLanguages();
      if (languages) {
        setAllLanguages(languages);
      }
    };
    loadLanguages();
  }, [getSupportedLanguages]);

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        disabled={isLoading}
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {selectedLanguage.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">
              인기 언어
            </div>
            {POPULAR_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 transition-colors ${
                  currentLanguage === language.code ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <span className="ml-auto text-pink-500">✓</span>
                )}
              </button>
            ))}
            
            {error && (
              <div className="text-xs text-red-500 px-2 py-1 mt-2">
                언어 목록을 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;