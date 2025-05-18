"use client";

import React, { useState } from 'react';
import { CharacteristicSlider } from '../components/CharacteristicSlider';
import { FragranceCharacteristic, PerfumeFeedback } from '@/app/types/perfume';
import { CHARACTERISTIC_NAMES } from '../constants/characteristics';

interface Step2ViewProps {
  feedback: PerfumeFeedback;
  setFeedback: React.Dispatch<React.SetStateAction<PerfumeFeedback>>;
}

export const Step2View: React.FC<Step2ViewProps> = ({ feedback, setFeedback }) => {
  const [activeCharacteristic, setActiveCharacteristic] = useState<FragranceCharacteristic>('weight');

  // 향 특성 변경 처리
  const handleCharacteristicChange = (characteristic: FragranceCharacteristic, value: string) => {
    setFeedback({
      ...feedback,
      userCharacteristics: {
        ...(feedback.userCharacteristics || {
          weight: 'medium',
          sweetness: 'medium',
          freshness: 'medium',
          uniqueness: 'medium'
        }),
        [characteristic]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* 향 특성 조정 UI */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-4 text-center">향의 특성을 조정해보세요</h3>
        
        <div className="flex space-x-2 mb-6 overflow-x-auto py-1 justify-center">
          {Object.keys(CHARACTERISTIC_NAMES).map((char) => (
            <button
              key={char}
              onClick={() => setActiveCharacteristic(char as FragranceCharacteristic)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeCharacteristic === char
                  ? 'bg-orange-500 text-white font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CHARACTERISTIC_NAMES[char as FragranceCharacteristic]}
            </button>
          ))}
        </div>

        <CharacteristicSlider
          characteristic={activeCharacteristic}
          value={feedback.userCharacteristics?.[activeCharacteristic] || 'medium'}
          onChange={handleCharacteristicChange}
        />
      </div>
    </div>
  );
};