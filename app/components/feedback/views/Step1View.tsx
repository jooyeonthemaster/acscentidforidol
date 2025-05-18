"use client";

import React from 'react';
import { RetentionSlider } from '../components/RetentionSlider';
import { PerfumeFeedback } from '@/app/types/perfume';

interface Step1ViewProps {
  feedback: PerfumeFeedback;
  setFeedback: React.Dispatch<React.SetStateAction<PerfumeFeedback>>;
}

export const Step1View: React.FC<Step1ViewProps> = ({ feedback, setFeedback }) => {
  // 유지 비율 변경 핸들러
  const handleRetentionChange = (retentionPercentage: number) => {
    setFeedback(prev => ({ ...prev, retentionPercentage }));
  };

  return (
    <div className="space-y-6">
      {/* 유지 비율 선택 UI */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-3 text-center">기존 향의 유지 비율</h3>

        <RetentionSlider 
          value={feedback.retentionPercentage ?? 50} 
          onChange={handleRetentionChange} 
        />
      </div>
    </div>
  );
};