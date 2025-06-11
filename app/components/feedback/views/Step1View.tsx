"use client";

import React from 'react';
import { RetentionSlider } from '../components/RetentionSlider';
import { PerfumeFeedback } from '@/app/types/perfume';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

interface Step1ViewProps {
  feedback: PerfumeFeedback;
  setFeedback: React.Dispatch<React.SetStateAction<PerfumeFeedback>>;
}

export const Step1View: React.FC<Step1ViewProps> = ({ feedback, setFeedback }) => {
  const { t } = useTranslationContext();
  // 유지 비율 변경 핸들러
  const handleRetentionChange = (retentionPercentage: number) => {
    setFeedback(prev => ({ ...prev, retentionPercentage }));
  };

  return (
    <div className="space-y-6">
      {/* 유지 비율 선택 UI */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-3 text-center">{t('feedback.retention.title', '기존 향의 유지 비율')}</h3>

        <RetentionSlider 
          value={feedback.retentionPercentage ?? 50} 
          onChange={handleRetentionChange} 
        />
      </div>
    </div>
  );
};