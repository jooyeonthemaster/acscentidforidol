"use client";

import React from 'react';
import { CategorySelector } from '../components/CategorySelector';
import { PerfumeCategory, CategoryPreference, PerfumeFeedback } from '@/app/types/perfume';

interface Step3ViewProps {
  feedback: PerfumeFeedback;
  setFeedback: React.Dispatch<React.SetStateAction<PerfumeFeedback>>;
}

export const Step3View: React.FC<Step3ViewProps> = ({ feedback, setFeedback }) => {
  // 카테고리 선호도 변경 처리
  const handleCategoryPreferenceChange = (category: PerfumeCategory, preference: CategoryPreference) => {
    setFeedback({
      ...feedback,
      categoryPreferences: {
        ...(feedback.categoryPreferences || {
          citrus: 'maintain',
          floral: 'maintain',
          woody: 'maintain',
          musky: 'maintain',
          fruity: 'maintain',
          spicy: 'maintain'
        }),
        [category]: preference,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 카테고리별 선호도 UI */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-4 text-center">향 카테고리 선호도 설정</h3>
        
        <div className="space-y-4">
          {Object.keys(feedback.categoryPreferences || {}).map((category) => (
            <CategorySelector
              key={category}
              category={category as PerfumeCategory}
              currentValue={feedback.categoryPreferences?.[category as PerfumeCategory] || 'maintain'}
              onChange={handleCategoryPreferenceChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};