"use client";

import React from 'react';
import { FragranceCharacteristic, CharacteristicValue } from '@/app/types/perfume';
import { 
  CHARACTERISTIC_NAMES, 
  CHARACTERISTIC_DESCRIPTIONS, 
  CHARACTERISTIC_LABELS,
  characteristicToSliderValue,
  sliderToCharacteristicValue
} from '../constants/characteristics';

interface CharacteristicSliderProps {
  characteristic: FragranceCharacteristic;
  value: CharacteristicValue;
  onChange: (char: FragranceCharacteristic, val: CharacteristicValue) => void;
}

export const CharacteristicSlider: React.FC<CharacteristicSliderProps> = ({ 
  characteristic, 
  value, 
  onChange 
}) => {
  const sliderValue = characteristicToSliderValue(value);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-xl">
            {characteristic === 'weight' && '⚖️'}
            {characteristic === 'sweetness' && '🍯'}
            {characteristic === 'freshness' && '❄️'}
            {characteristic === 'uniqueness' && '✨'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {CHARACTERISTIC_NAMES[characteristic]}을(를) 조정해보세요
          </span>
        </div>
        <span className="text-sm font-medium text-orange-500">
          {CHARACTERISTIC_LABELS[characteristic][value]}
        </span>
      </div>

      <div className="flex items-center mb-6">
        <div className="flex flex-col items-center mr-2">
          <span className="text-xs text-gray-500 mb-1">낮음</span>
        </div>
        
        <div className="flex-1 relative">
          <div className="w-full h-1 bg-gray-200 rounded-full">
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              style={{ width: `${(sliderValue / 5) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 px-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => onChange(characteristic, sliderToCharacteristicValue(val))}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  sliderValue === val 
                    ? 'bg-orange-500 text-white font-bold' 
                    : 'bg-white border border-gray-300 text-gray-600'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-center ml-2">
          <span className="text-xs text-gray-500 mb-1">높음</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-1">
        {CHARACTERISTIC_DESCRIPTIONS[characteristic]}
      </p>
    </div>
  );
};