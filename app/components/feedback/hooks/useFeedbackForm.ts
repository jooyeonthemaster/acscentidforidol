"use client";

import { useState, useEffect } from 'react';
import { PerfumeFeedback, GeminiPerfumeSuggestion } from '@/app/types/perfume';

// 초기 피드백 데이터
export const INITIAL_FEEDBACK_DATA: PerfumeFeedback = {
  perfumeId: '',
  retentionPercentage: 50, // 기본값 50%로 변경
  categoryPreferences: {
    citrus: 'maintain',
    floral: 'maintain',
    woody: 'maintain',
    musky: 'maintain', 
    fruity: 'maintain',
    spicy: 'maintain'
  },
  userCharacteristics: {
    weight: 'medium',
    sweetness: 'medium',
    freshness: 'medium',
    uniqueness: 'medium'
  },
  specificScents: [],
  notes: '',
};

export const useFeedbackForm = (perfumeId: string) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PerfumeFeedback>({
    ...INITIAL_FEEDBACK_DATA,
    perfumeId,
  });
  const [recipe, setRecipe] = useState<GeminiPerfumeSuggestion | null>(null);
  const [customizationLoading, setCustomizationLoading] = useState(false);

  const resetForm = () => {
    setStep(1);
    setSuccess(false);
    setError(null);
    setRecipe(null);
    setFeedback({
      ...INITIAL_FEEDBACK_DATA,
      perfumeId,
    });
    setLoading(false);
    setCustomizationLoading(false);
  };

  // 피드백 제출 처리
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submissionData: PerfumeFeedback = {
        ...feedback,
        submittedAt: new Date().toISOString()
      };

      if (submissionData.specificScents?.length) {
        submissionData.specificScents = submissionData.specificScents.filter(
          scent => scent.id && scent.name && (scent.ratio ?? 0) > 0
        );
      }

      // 1. 먼저 피드백 제출
      const feedbackResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json();
        throw new Error(errorData.error || '피드백 제출 중 오류가 발생했습니다.');
      }

      // 로컬 스토리지에 피드백 저장 (중복 제출 방지)
      localStorage.setItem('submittedFeedbacks', JSON.stringify([
        ...JSON.parse(localStorage.getItem('submittedFeedbacks') || '[]'),
        { perfumeId, submittedAt: new Date().toISOString() },
      ]));

      setLoading(false);
      setSuccess(true);
      
      // 2. 커스터마이제이션 API 호출
      setCustomizationLoading(true);
      setError(null);
      
      try {
        const customizeResponse = await fetch('/api/perfume/customize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            feedback: submissionData
          }),
        });
        
        if (!customizeResponse.ok) {
          const errorData = await customizeResponse.json();
          console.error('커스터마이제이션 API 오류:', errorData);
          setError(errorData.error || '맞춤 레시피 생성 중 오류가 발생했습니다.');
        } else {
          const customizeData = await customizeResponse.json();
          if (customizeData.success && customizeData.data) {
            setRecipe(customizeData.data as GeminiPerfumeSuggestion);
            setSuccess(true);
          } else {
            console.error('커스터마이제이션 API 응답 형식 오류:', customizeData);
            setError(customizeData.error || '맞춤 레시피 데이터를 받지 못했습니다.');
          }
        }
      } catch (customizeErr) {
        console.error('커스터마이제이션 API 호출 오류:', customizeErr);
        setError(customizeErr instanceof Error ? customizeErr.message : '맞춤 레시피 생성 중 알 수 없는 오류입니다.');
      } finally {
        setCustomizationLoading(false);
      }
      
      // 커스터마이제이션 결과가 표시되므로 자동으로 모달을 닫지 않음
    } catch (err) {
      setLoading(false);
      setCustomizationLoading(false);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('피드백 및 커스터마이징 처리 오류:', err);
      setSuccess(false);
    }
  };

  // 단계 이동 처리
  const handleNextStep = () => {
    setError(null);
    if (step < 3) {  // 단계 수 3으로 변경
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return {
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
    resetForm,
  };
};