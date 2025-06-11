"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfumePersona, RecipeHistoryItem } from '@/app/types/perfume';
import { motion } from 'framer-motion';
import FeedbackForm from '@/app/components/feedback/FeedbackForm';
import RecipeHistory from '@/app/components/RecipeHistory';
import { useTranslationContext } from '@/app/contexts/TranslationContext';
import GlobalLanguageSelector from '@/components/GlobalLanguageSelector';

// 피드백 데이터 인터페이스
interface PerfumeFeedback {
  perfumeId: string;
  retentionPercentage: number; // 향 유지 비율 (0%, 20%, 40%, 60%, 80%, 100%)
  intensity: number;           // 향의 강도 (1-5)
  sweetness: number;           // 단맛 (1-5)
  bitterness: number;          // 쓴맛 (1-5)
  sourness: number;            // 시큼함 (1-5)
  freshness: number;           // 신선함 (1-5)
  notes: string;               // 추가 코멘트
}

export default function FeedbackPage() {
  const router = useRouter();
  const { t, currentLanguage, setLanguage, isTranslating } = useTranslationContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfume, setPerfume] = useState<PerfumePersona | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showRecipeHistory, setShowRecipeHistory] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeHistoryItem | undefined>(undefined);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // 사용자 ID와 세션 ID (실제로는 인증 시스템에서 가져와야 함)
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || 'user_' + Date.now();
    }
    return 'user_' + Date.now();
  });
  
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentSessionId') || 'session_' + Date.now();
    }
    return 'session_' + Date.now();
  });

  // 언어 목록 정의
  const LANGUAGES = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-cn', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const selectedLanguage = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  // 언어 선택 핸들러
  const handleLanguageSelect = async (languageCode: string) => {
    setShowLanguageSelector(false);
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode);
    }
  };

  useEffect(() => {
    try {
      // 로컬 스토리지에서 분석 결과 불러오기
      const storedResult = localStorage.getItem('analysisResult');
      
      if (!storedResult) {
        setError(t('error.result.not.found'));
        setLoading(false);
        return;
      }
      
      // 분석 결과 파싱하여 향수 정보 가져오기
      const parsedResult = JSON.parse(storedResult);
      const topMatch = parsedResult.matchingPerfumes?.find((p: any) => p.persona);
      
      if (!topMatch || !topMatch.persona) {
        setError(t('feedback.error.noPerfume'));
        setLoading(false);
        return;
      }
      
      setPerfume(topMatch.persona);
      setLoading(false);
      setIsLoaded(true);

      // 사용자 ID와 세션 ID를 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', userId);
        localStorage.setItem('currentSessionId', sessionId);
      }
    } catch (err) {
      console.error('결과 로딩 오류:', err);
      setError(t('error.result.loading'));
      setLoading(false);
    }
  }, [userId, sessionId, t]);

  // 피드백 제출 처리
  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true);
    // 사용자를 다음 페이지로 리디렉션하는 대신, 
    // 컴포넌트 내에서 상태를 업데이트하여 성공 메시지를 표시
  };
  
  // 결과 페이지로 돌아가기
  const handleBack = () => {
    router.push('/result');
  };

  // 모달 닫기
  const handleClose = () => {
    if (feedbackSubmitted) {
      // 피드백이 제출되었으면 결과 페이지로 리디렉션
      router.push('/result');
    } else {
      // 제출하지 않고 닫으면 그냥 뒤로가기
      handleBack();
    }
  };

  // 레시피 선택 핸들러
  const handleRecipeSelect = (recipe: RecipeHistoryItem) => {
    console.log('레시피 선택됨:', recipe);
  };

  // 레시피 활성화 핸들러
  const handleRecipeActivate = (recipe: RecipeHistoryItem) => {
    setCurrentRecipe(recipe);
    setShowRecipeHistory(false);
    alert(`${recipe.originalPerfumeName || t('feedback.recipe')}${t('feedback.recipeActivated')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-bounce bg-yellow-400 rounded-full h-4 w-4 mr-1"></div>
          <div className="animate-bounce bg-yellow-300 rounded-full h-4 w-4 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-yellow-200 rounded-full h-4 w-4" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-yellow-800 font-medium">{t('feedback.loading')}</p>
      </div>
    );
  }

  if (error || !perfume) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">{t('error.general')}</h2>
          <p className="text-gray-700 mb-6">{error || t('feedback.error.perfumeInfo')}</p>
          <button
            onClick={() => router.push('/result')}
            className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            {t('feedback.backToResult')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-4 px-4 sm:px-6">
      {/* 고정된 상단 언어 선택기 */}
      <div className="fixed top-4 right-4 z-[60]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            disabled={isTranslating}
            className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <span className="text-lg">{selectedLanguage.flag}</span>
            <span className="text-sm font-medium text-gray-700">
              {selectedLanguage.name}
            </span>
            {isTranslating ? (
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {showLanguageSelector && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden z-[70]">
              <div className="py-1">
                {LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                      currentLanguage === language.code ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-base">{language.flag}</span>
                    <span className="font-medium flex-1">{language.name}</span>
                    {currentLanguage === language.code && (
                      <span className="text-yellow-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
              
              {isTranslating && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-600">{t('translating') || '번역 중...'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {showLanguageSelector && (
            <div 
              className="fixed inset-0 z-[59]" 
              onClick={() => setShowLanguageSelector(false)}
            />
          )}
        </motion.div>
      </div>

      {/* 페이지 제목 헤더 - 모바일에서만 표시 */}
      <div className="mb-6 lg:hidden">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-800 text-center"
        >
          {t('feedback.title')}
        </motion.h1>
      </div>

      <div className="max-w-lg mx-auto lg:max-w-7xl">


        {/* 레시피 히스토리 버튼 */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* 레시피 히스토리 토글 버튼 */}
            <div className="mb-4">
              <button
                onClick={() => setShowRecipeHistory(!showRecipeHistory)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">
                  📚 {t('feedback.recipeHistory')}
                </span>
                <span className={`transform transition-transform ${showRecipeHistory ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </button>
            </div>

            {/* 모바일용 레시피 히스토리 컴포넌트 */}
            {showRecipeHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RecipeHistory
                  userId={userId}
                  sessionId={sessionId}
                  currentRecipe={currentRecipe}
                  onRecipeSelect={handleRecipeSelect}
                  onRecipeActivate={handleRecipeActivate}
                  className="max-h-80 overflow-y-auto mb-4"
                />
              </motion.div>
            )}

            {/* 모바일용 도움말 카드 */}
            {!showRecipeHistory && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 {t('feedback.tip')}</h4>
                <p className="text-sm text-blue-800">
                  {t('feedback.tipDescription')}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 피드백 폼 */}
          <div className="lg:col-span-2">
            {/* FeedbackForm 컴포넌트 사용 */}
            {perfume && (
              <FeedbackForm 
                originalPerfume={perfume}
                onClose={handleClose}
                onSubmit={handleFeedbackSubmit}
              />
            )}
          </div>

          {/* 데스크톱용 레시피 히스토리 사이드바 */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="sticky top-8"
            >
              {/* 레시피 히스토리 토글 버튼 */}
              <div className="mb-4">
                <button
                  onClick={() => setShowRecipeHistory(!showRecipeHistory)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    📚 {t('feedback.recipeHistory')}
                  </span>
                  <span className={`transform transition-transform ${showRecipeHistory ? 'rotate-180' : ''}`}>
                    ⌄
                  </span>
                </button>
              </div>

              {/* 레시피 히스토리 컴포넌트 */}
              {showRecipeHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RecipeHistory
                    userId={userId}
                    sessionId={sessionId}
                    currentRecipe={currentRecipe}
                    onRecipeSelect={handleRecipeSelect}
                    onRecipeActivate={handleRecipeActivate}
                    className="max-h-96 overflow-y-auto"
                  />
                </motion.div>
              )}

              {/* 도움말 카드 */}
              {!showRecipeHistory && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">💡 {t('feedback.tip')}</h4>
                  <p className="text-sm text-blue-800">
                    {t('feedback.tipDescription')}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 