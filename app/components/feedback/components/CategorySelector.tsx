"use client";

import React from 'react';
import { PerfumeCategory, CategoryPreference } from '@/app/types/perfume';
import { CATEGORY_NAMES, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS, CATEGORY_EXAMPLES } from '../constants/categories';

interface CategorySelectorProps {
  category: PerfumeCategory;
  currentValue: CategoryPreference;
  onChange: (cat: PerfumeCategory, pref: CategoryPreference) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  category, 
  currentValue, 
  onChange 
}) => {
  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mr-3 text-2xl">
          {CATEGORY_ICONS[category]}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{CATEGORY_NAMES[category]}</h3>
          <p className="text-xs text-gray-500 mt-1">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>
      </div>
      
      <div className="mt-2 mb-1">
        <p className="text-xs text-gray-600">
          <span className="font-medium">예시</span>: {CATEGORY_EXAMPLES[category]}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button 
          onClick={() => onChange(category, 'decrease')}
          className={`py-3 px-1 rounded-lg transition-all ${
            currentValue === 'decrease' 
              ? 'bg-orange-100 border-2 border-orange-500 text-orange-700 font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">👇</span>
            <span className="text-xs font-medium">더 약하게</span>
          </div>
        </button>
        
        <button
          onClick={() => onChange(category, 'maintain')}
          className={`py-3 px-1 rounded-lg transition-all ${
            currentValue === 'maintain' 
              ? 'bg-orange-100 border-2 border-orange-500 text-orange-700 font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">👌</span>
            <span className="text-xs font-medium">현재 유지</span>
          </div>
        </button>
        
        <button 
          onClick={() => onChange(category, 'increase')}
          className={`py-3 px-1 rounded-lg transition-all ${
            currentValue === 'increase' 
              ? 'bg-orange-100 border-2 border-orange-500 text-orange-700 font-medium' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">👆</span>
            <span className="text-xs font-medium">더 강하게</span>
          </div>
        </button>
      </div>
    </div>
  );
};