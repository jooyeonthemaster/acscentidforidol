"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

// Views
import { Step1View } from './views/Step1View';
import { Step2View } from './views/Step2View';
import { Step3View } from './views/Step3View';
import { SuccessView } from './views/SuccessView';

// Hooks
import { useFeedbackForm } from './hooks/useFeedbackForm';
import { PerfumePersona } from '@/app/types/perfume';

// Chart.js 등록
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

interface FeedbackFormProps {
  originalPerfume: PerfumePersona;
  onClose: () => void;
  onSubmit: () => void;
  // resetForm prop 추가 (SuccessView로 전달하기 위함)
  // resetForm?: () => void; // SuccessView 내부에서 직접 사용하지 않고, SuccessView에 resetForm을 전달하기 위한 용도로 일단 주석 처리
}

export default function FeedbackForm({ 
  originalPerfume, 
  onClose, 
  onSubmit 
}: FeedbackFormProps) {
  const { t } = useTranslationContext();
  // 사용자 ID와 세션 ID 가져오기
  const [userId] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        console.error('❌ 세션이 시작되지 않았습니다. 홈페이지에서 새로 시작해주세요.');
      }
      return storedUserId || 'user_' + Date.now();
    }
    return 'user_' + Date.now();
  });
  
  const [sessionId] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const storedSessionId = localStorage.getItem('currentSessionId');
      if (!storedSessionId) {
        console.error('❌ 현재 세션을 찾을 수 없습니다. 홈페이지에서 새로 시작해주세요.');
      }
      return storedSessionId || 'session_' + Date.now();
    }
    return 'session_' + Date.now();
  });

  // 커스텀 훅을 사용하여 폼 상태와 로직을 관리
  const {
    step,
    loading,
    success,
    error,
    feedback,
    recipe,
    customizationLoading,
    setFeedback,
    setError,
    handleNextStep,
    handlePrevStep,
    resetForm, // useFeedbackForm으로부터 resetForm 함수를 가져옵니다.
  } = useFeedbackForm(originalPerfume.id, userId, sessionId);

  // 현재 단계에 따른 타이틀
  const stepTitle = () => {
    switch(step) {
      case 1: return t('feedback.step1.title', '향의 유지 비율 선택');
      case 2: return t('feedback.step2.title', '향 카테고리 선호도 설정');
      case 3: return t('feedback.step3.title', '특정 향료 추가');
      default: return '';
    }
  };

  // 총 단계 수
  const totalSteps = 3;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg overflow-y-auto relative"
    >
      {/* 상단 닫기 버튼 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 헤더 영역 */}
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mr-3 text-xl text-white">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">AC'SCENT ID</h2>
              <p className="text-xs text-gray-500">{t('feedback.subtitle', '당신만의 맞춤 향수')}</p>
            </div>
          </div>

          {/* 추천된 향수 정보 표시 */}
          <div className="mt-3 flex items-center bg-amber-50 rounded-lg p-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 text-lg">
              🧪
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">{t('feedback.customPerfume', '맞춤 향수')}</p>
              <h3 className="text-sm font-medium text-gray-800">{originalPerfume.name}</h3>
              <p className="text-xs text-orange-600">{originalPerfume.id}</p>
            </div>
          </div>
        </div>

        {/* 진행 상태 표시 (성공 상태가 아닐 때만) */}
        {!success && (
          <div className="px-4 pb-4">
            <div className="flex justify-between mb-2 items-center">
              <span className="text-xs font-medium bg-orange-500 text-white py-1 px-2 rounded-full">
                {t('feedback.step', '단계')} {step}/{totalSteps}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {stepTitle()}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-start"
          >
            <div className="shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-2 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* 폼 내용 영역 */}
        <div className="px-4 pb-6">
          {/* 성공 메시지 & 커스터마이제이션 결과 */}
          {success ? (
            <SuccessView 
              feedback={feedback} 
              recipe={recipe} 
              originalPerfume={originalPerfume}
              customizationLoading={customizationLoading} 
              onClose={onClose} 
              onResetForm={resetForm} // resetForm 함수를 SuccessView에 onResetForm prop으로 전달합니다.
              userId={userId}
              sessionId={sessionId}
            />
          ) : (
            // 피드백 폼 인터페이스 (성공이 아닐 때)
            <div>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Step1View feedback={feedback} setFeedback={setFeedback} />
                  </motion.div>
                )}
                
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Step2View feedback={feedback} setFeedback={setFeedback} />
                  </motion.div>
                )}
                
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Step3View feedback={feedback} setFeedback={setFeedback} setError={setError} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 버튼 영역 */}
              <div className="flex justify-between mt-6 gap-3">
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  {step === 1 ? t('common.close', '닫기') : t('common.back', '이전으로')}
                </button>
                
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-lg text-white transition-colors shadow-md ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('feedback.processing', '처리 중...')}
                    </div>
                  ) : step < totalSteps ? (
                    t('feedback.next', '다음으로')
                  ) : (
                    t('feedback.submit', '제출하기')
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
    </motion.div>
  );
}