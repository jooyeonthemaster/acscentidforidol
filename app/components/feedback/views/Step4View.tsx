"use client";

import React, { useState } from 'react';
import { ScentSelector, SelectedScents } from '../components/ScentSelector';
import { PerfumeCategory, PerfumeFeedback, SpecificScent } from '@/app/types/perfume';
import { generateAvailableScents } from '../utils/formatters';

interface Step4ViewProps {
  feedback: PerfumeFeedback;
  setFeedback: React.Dispatch<React.SetStateAction<PerfumeFeedback>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const Step4View: React.FC<Step4ViewProps> = ({ 
  feedback, 
  setFeedback,
  setError
}) => {
  const [selectedScent, setSelectedScent] = useState<SpecificScent | null>(null);
  const [scentSearchTerm, setScentSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PerfumeCategory>('citrus');
  
  // 향료 데이터
  const availableScents = generateAvailableScents();

  // 향료 추가 처리
  const handleAddScent = () => {
    if (selectedScent) {
      const updatedScents = [...(feedback.specificScents || [])];
      
      // 이미 있는 향료인지 확인
      const existingIndex = updatedScents.findIndex(s => s.id === selectedScent.id);
      
      if (existingIndex >= 0) {
        // 이미 있는 향료면 알림
        setError('이미 선택한 향료입니다.');
        setTimeout(() => setError(null), 3000); // 3초 후 에러 메시지 사라짐
      } else {
        // 새 향료 추가 (최대 2개까지만 허용)
        if (updatedScents.length >= 2) {
          // 이미 2개가 있으면 알림 표시 후 종료
          setError('향료는 최대 2개까지만 선택할 수 있습니다.');
          setTimeout(() => setError(null), 3000); // 3초 후 에러 메시지 사라짐
          setSelectedScent(null);
          return;
        }
        
        // SpecificScent 형식에 맞추기
        updatedScents.push({
          id: selectedScent.id,
          name: selectedScent.name,
          ratio: 50, // 기본값 50%
          action: 'add' // 필수 속성
        });
      }
      
      setFeedback({
        ...feedback,
        specificScents: updatedScents,
      });
      
      setSelectedScent(null);
    }
  };

  // 향료 제거 처리
  const handleRemoveScent = (id: string) => {
    if (feedback.specificScents) {
      setFeedback({
        ...feedback,
        specificScents: feedback.specificScents.filter(s => s.id !== id),
      });
    }
  };

  // 향료 비율 변경 처리
  const handleScentRatioChange = (id: string, ratio: number) => {
    if (feedback.specificScents) {
      const newScents = [...feedback.specificScents];
      const index = newScents.findIndex(s => s.id === id);
      if (index >= 0) {
        newScents[index] = {
          ...newScents[index],
          ratio: ratio
        };
        setFeedback({...feedback, specificScents: newScents});
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 향료 검색 및 선택 UI */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-4 text-center">특정 향료 추가하기 (선택사항)</h3>
        
        <ScentSelector
          availableScents={availableScents}
          selectedScent={selectedScent}
          setSelectedScent={setSelectedScent}
          scentSearchTerm={scentSearchTerm}
          setScentSearchTerm={setScentSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onAddScent={handleAddScent}
        />

        {/* 선택된 향료 목록 */}
        {feedback.specificScents?.length ? (
          <div className="mt-6">
            <SelectedScents
              scents={feedback.specificScents}
              onRemove={handleRemoveScent}
              onRatioChange={handleScentRatioChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};