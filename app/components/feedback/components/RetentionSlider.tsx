"use client";

import React from 'react';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

interface RetentionSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const RetentionSlider: React.FC<RetentionSliderProps> = ({ value, onChange }) => {
  const { t } = useTranslationContext();
  // 20% 단위로 선택할 수 있는 옵션 배열
  const percentageOptions = [0, 20, 40, 60, 80, 100];
  
  return (
    <div className="mt-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          {t('feedback.retention.question', '원래 향을 얼마나 유지하고 싶으신가요?')}
        </p>
      </div>
      
      {/* 선택 버튼 그룹 */}
      <div className="grid grid-cols-6 gap-1 mt-3">
        {percentageOptions.map((percent) => (
          <button
            key={percent}
            onClick={() => onChange(percent)}
            className={`py-2 rounded-lg transition-all ${
              value === percent 
                ? 'bg-orange-500 text-white font-bold' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {percent}%
          </button>
        ))}
      </div>
      
      {/* 시각적 표시 바 */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mt-4">
        <div 
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{t('feedback.retention.changeCompletely', '완전히 변경')}</span>
        <span>{t('feedback.retention.keepCompletely', '완전히 유지')}</span>
      </div>
      
      <div className="text-center mt-4">
        <span className="text-lg font-bold text-orange-500">{value}%</span>
      </div>
    </div>
  );
};