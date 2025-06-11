'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/app/utils/useTranslation';
import LanguageSelector from './LanguageSelector';

export const TranslationDemo: React.FC = () => {
  const [inputText, setInputText] = useState('안녕하세요! 뿌리는 덕질 서비스에 오신 것을 환영합니다. 최애의 매력을 향으로 표현해보세요!');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  
  const { translate, detectLanguage, isLoading, error, clearError } = useTranslation();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    clearError();
    const result = await translate(inputText, targetLanguage);
    if (result) {
      setTranslatedText(result);
    }
  };

  const handleDetectLanguage = async () => {
    if (!inputText.trim()) return;
    
    clearError();
    const language = await detectLanguage(inputText);
    if (language) {
      setDetectedLanguage(language);
    }
  };

  const handleTestMultipleTexts = async () => {
    const testTexts = [
      '향수 추천',
      '매칭률',
      '이미지 분석',
      '퍼스널 컬러',
      '덕질 향수'
    ];
    
    clearError();
    const results = await translate(testTexts.join('\n'), targetLanguage);
    if (results) {
      setTranslatedText(results);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        🌍 번역 기능 테스트
      </h2>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            ❌ {error.message}
          </p>
          <button 
            onClick={clearError}
            className="mt-2 text-red-600 hover:text-red-800 text-xs underline"
          >
            오류 메시지 닫기
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 영역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            번역할 텍스트
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            placeholder="번역할 텍스트를 입력하세요..."
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleDetectLanguage}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? '감지 중...' : '언어 감지'}
            </button>
            
            {detectedLanguage && (
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                감지된 언어: {detectedLanguage.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        
        {/* 출력 영역 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            번역 결과
          </label>
          <textarea
            value={translatedText}
            readOnly
            className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
            placeholder="번역 결과가 여기에 표시됩니다..."
          />
        </div>
      </div>
      
      {/* 컨트롤 영역 */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            번역할 언어:
          </label>
          <LanguageSelector
            currentLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            className="min-w-[200px]"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleTestMultipleTexts}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? '번역 중...' : '샘플 텍스트 번역'}
          </button>
          
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? '번역 중...' : '번역하기'}
          </button>
        </div>
      </div>
      
      {/* 사용법 안내 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">💡 사용법</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 텍스트 입력 후 "번역하기" 버튼을 클릭하세요</li>
          <li>• "언어 감지" 버튼으로 입력 텍스트의 언어를 확인할 수 있습니다</li>
          <li>• "샘플 텍스트 번역"으로 서비스 주요 용어들을 번역해볼 수 있습니다</li>
          <li>• 언어 선택기에서 번역할 대상 언어를 선택할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default TranslationDemo; 