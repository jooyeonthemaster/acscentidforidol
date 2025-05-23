"use client";

import React from 'react';
import { PerfumeCategory, SpecificScent } from '@/app/types/perfume';
import { CATEGORY_NAMES } from '../constants/categories';
import { formatScentCode } from '../utils/formatters';

interface ScentSelectorProps {
  availableScents: SpecificScent[];
  selectedScent: SpecificScent | null;
  setSelectedScent: (scent: SpecificScent | null) => void;
  scentSearchTerm: string;
  setScentSearchTerm: (term: string) => void;
  selectedCategory: PerfumeCategory;
  setSelectedCategory: (category: PerfumeCategory) => void;
  onAddScent: () => void;
}

export const ScentSelector: React.FC<ScentSelectorProps> = ({
  availableScents,
  selectedScent,
  setSelectedScent,
  scentSearchTerm,
  setScentSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onAddScent
}) => {
  // 사용 가능한 모든 카테고리
  const categoryOptions: PerfumeCategory[] = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <div className="flex-1 mr-2">
            <input
              type="text"
              placeholder="향료 이름으로 검색하세요..."
              value={scentSearchTerm}
              onChange={(e) => setScentSearchTerm(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50 text-gray-900 placeholder-gray-600"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PerfumeCategory)}
              className="p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white">
          {availableScents
            .filter(scent => 
              (scentSearchTerm === '' || scent.name.toLowerCase().includes(scentSearchTerm.toLowerCase())) &&
              (scent.category === selectedCategory)
            )
            .slice(0, 8) // 최대 8개까지만 표시
            .map((scent) => (
              <div
                key={scent.id}
                onClick={() => setSelectedScent(scent)}
                className={`p-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer transition-colors ${
                  selectedScent?.id === scent.id ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-orange-600">{formatScentCode(scent.id || '')}</p>
                    <p className="text-sm text-gray-600">{scent.name}</p>
                    <p className="text-xs text-gray-500">{scent.description}</p>
                  </div>
                  <div className="text-xs bg-orange-100 text-orange-600 h-fit rounded-full px-2 py-0.5">
                    {scent.category || 'woody'}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onAddScent}
          disabled={!selectedScent}
          className={`px-5 py-2.5 rounded-lg transition-colors ${
            selectedScent
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          선택한 향료 추가하기
        </button>
      </div>
    </div>
  );
};

// 선택된 향료 표시 컴포넌트
interface SelectedScentsProps {
  scents: SpecificScent[];
  onRemove: (id: string) => void;
  onRatioChange: (id: string, ratio: number) => void;
}

export const SelectedScents: React.FC<SelectedScentsProps> = ({ 
  scents, 
  onRemove, 
  onRatioChange 
}) => {
  if (!scents || scents.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="font-medium text-gray-800 mb-4">선택한 향료 ({scents.length}/2)</h3>
      
      <div className="space-y-4 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ maxHeight: '300px' }}>
        {scents.map((scent) => (
          <div key={scent.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-orange-600">{formatScentCode(scent.id || '')}</p>
                <p className="text-sm text-gray-700">{scent.name}</p>
              </div>
              <button
                onClick={() => onRemove(scent.id || '')}
                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <input
              type="hidden"
              value={scent.ratio ?? 50}
              onChange={(e) => onRatioChange(scent.id || '', parseInt(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};