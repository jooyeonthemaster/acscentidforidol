"use client";

import React from 'react';
import { impressionOptions } from '../constants/impressions';

interface ImpressionSelectorProps {
  selectedImpression: string;
  onChange: (value: string) => void;
}

export const ImpressionSelector: React.FC<ImpressionSelectorProps> = ({ 
  selectedImpression, 
  onChange
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-amber-100 shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">이 향수에 대한 첫인상은 어떤가요?</h3>
      <div className="grid grid-cols-5 gap-2">
        {impressionOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
              selectedImpression === option.value
                ? 'bg-amber-50 border-amber-300 shadow-sm'
                : 'border-gray-200 hover:border-amber-200'
            }`}
          >
            <span className="text-2xl mb-1">{option.value}</span>
            <span className="text-xs text-gray-600">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};