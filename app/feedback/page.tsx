"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfumePersona, RecipeHistoryItem } from '@/app/types/perfume';
import { motion } from 'framer-motion';
import FeedbackForm from '@/app/components/feedback/FeedbackForm';
import RecipeHistory from '@/app/components/RecipeHistory';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfume, setPerfume] = useState<PerfumePersona | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showRecipeHistory, setShowRecipeHistory] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeHistoryItem | undefined>(undefined);
  
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

  useEffect(() => {
    try {
      // 로컬 스토리지에서 분석 결과 불러오기
      const storedResult = localStorage.getItem('analysisResult');
      
      if (!storedResult) {
        setError('분석 결과를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 분석 결과 파싱하여 향수 정보 가져오기
      const parsedResult = JSON.parse(storedResult);
      const topMatch = parsedResult.matchingPerfumes?.find((p: any) => p.persona);
      
      if (!topMatch || !topMatch.persona) {
        setError('추천된 향수 정보를 찾을 수 없습니다.');
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
      setError('향수 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [userId, sessionId]);

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
    alert(`${recipe.originalPerfumeName || '레시피'}가 활성화되었습니다!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-bounce bg-yellow-400 rounded-full h-4 w-4 mr-1"></div>
          <div className="animate-bounce bg-yellow-300 rounded-full h-4 w-4 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-yellow-200 rounded-full h-4 w-4" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-yellow-800 font-medium">향수 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !perfume) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">오류 발생</h2>
          <p className="text-gray-700 mb-6">{error || '향수 정보를 불러올 수 없습니다. 다시 시도해주세요.'}</p>
          <button
            onClick={() => router.push('/result')}
            className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 모바일용 레시피 히스토리 버튼 (상단) */}
        <div className="lg:hidden mb-6">
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
                  📚 이전 레시피 보기
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
                <h4 className="font-medium text-blue-900 mb-2">💡 팁</h4>
                <p className="text-sm text-blue-800">
                  이전에 생성된 레시피들을 다시 확인하고 비교할 수 있습니다. 
                  마음에 들었던 이전 레시피가 있다면 다시 활성화해보세요!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 피드백 폼 */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 shadow-lg"
            >
              {/* 왼쪽 위 점 장식 */}
              <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 오른쪽 아래 캐릭터 */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="absolute -right-4 bottom-32 w-24 h-24"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src="/cute2.png" 
                    alt="Cute Character" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </motion.div>
              
              {/* 왼쪽 하단 장식 */}
              <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 헤더 영역 */}
              <div className="text-center mb-6 pt-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  <span className="bg-yellow-300 px-2 py-1">향수 피드백</span>
                </h1>
                <p className="text-gray-600 text-sm">
                  추천된 향수에 대한 피드백을 입력해주세요.
                </p>
                
                {/* 현재 활성화된 레시피 표시 */}
                {currentRecipe && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎯 <strong>활성화된 레시피:</strong> {currentRecipe.originalPerfumeName || '이전 레시피'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {currentRecipe.testingRecipe?.granules?.length || 0}개 향료 조합
                    </p>
                  </div>
                )}
              </div>

              {/* FeedbackForm 컴포넌트 사용 */}
              {perfume && (
                <FeedbackForm 
                  originalPerfume={perfume}
                  onClose={handleClose}
                  onSubmit={handleFeedbackSubmit}
                />
              )}
            </motion.div>
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
                    📚 이전 레시피 보기
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
                  <h4 className="font-medium text-blue-900 mb-2">💡 팁</h4>
                  <p className="text-sm text-blue-800">
                    이전에 생성된 레시피들을 다시 확인하고 비교할 수 있습니다. 
                    마음에 들었던 이전 레시피가 있다면 다시 활성화해보세요!
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