"use client";

import { useState, useEffect } from 'react';
import { PerfumeFeedback, CustomPerfumeRecipe } from '@/app/types/perfume';

// 초기 피드백 데이터
export const INITIAL_FEEDBACK_DATA: PerfumeFeedback = {
  perfumeId: '',
  impression: '',
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
  const [recipe, setRecipe] = useState<CustomPerfumeRecipe | null>(null);
  const [customizationLoading, setCustomizationLoading] = useState(false);

  // 피드백 제출 처리
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // 향의 강도나 지속력 관련 피드백 제거
      const submissionData: PerfumeFeedback = {
        ...feedback,
        submittedAt: new Date().toISOString()
      };

      // specificScents에서 빈 항목 제거
      if (submissionData.specificScents?.length) {
        submissionData.specificScents = submissionData.specificScents.filter(
          scent => scent.id && scent.name && scent.ratio > 0
        );
      }

      // 1. 먼저 피드백 제출
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '피드백 제출 중 오류가 발생했습니다.');
      }

      // 로컬 스토리지에 피드백 저장 (중복 제출 방지)
      const storedFeedbacks = JSON.parse(localStorage.getItem('submittedFeedbacks') || '[]');
      localStorage.setItem('submittedFeedbacks', JSON.stringify([
        ...storedFeedbacks,
        { perfumeId, submittedAt: new Date().toISOString() },
      ]));

      setLoading(false);
      setSuccess(true);
      
      // 2. 커스터마이제이션 API 호출
      setCustomizationLoading(true);
      
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
          // API 오류가 발생하더라도 피드백은 제출 완료되었으므로 치명적 오류로 처리하지 않음
        } else {
          const customizeData = await customizeResponse.json();
          setRecipe(customizeData.recipe);
        }
      } catch (customizeErr) {
        console.error('커스터마이제이션 API 호출 오류:', customizeErr);
      } finally {
        setCustomizationLoading(false);
      }
      
      // 커스터마이제이션 결과가 표시되므로 자동으로 모달을 닫지 않음
    } catch (err) {
      setLoading(false);
      setCustomizationLoading(false);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('피드백 제출 오류:', err);
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
  };
};