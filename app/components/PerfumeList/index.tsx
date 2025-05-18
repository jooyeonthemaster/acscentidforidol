'use client';

import React from 'react';
import { Perfume, PerfumeCategory } from '../../types/perfume';

interface PerfumeListProps {
  perfumes: Perfume[];
  selectedCategory?: PerfumeCategory;
  onCategorySelect: (category: PerfumeCategory | undefined) => void;
}

// 임시 PerfumeList 컴포넌트
const PerfumeList: React.FC<PerfumeListProps> = ({ 
  perfumes, 
  selectedCategory, 
  onCategorySelect 
}) => {
  // 카테고리 목록
  const categories: PerfumeCategory[] = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'];
  
  // 카테고리 한글 이름
  const categoryNames: Record<PerfumeCategory, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 카테고리 필터링된 향수 목록
  const filteredPerfumes = selectedCategory 
    ? perfumes.filter(p => p.category === selectedCategory) 
    : perfumes;
  
  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => onCategorySelect(undefined)}
          className={`px-4 py-2 rounded-full text-sm ${
            selectedCategory === undefined
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          전체
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {categoryNames[category]}
          </button>
        ))}
      </div>
      
      {/* 향수 목록 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPerfumes.length > 0 ? (
          filteredPerfumes.map(perfume => (
            <div key={perfume.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {perfume.imageUrl ? (
                  <img 
                    src={perfume.imageUrl} 
                    alt={perfume.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">이미지 없음</span>
                )}
              </div>
              
              <div className="p-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                  {categoryNames[perfume.category]}
                </span>
                <h3 className="text-lg font-semibold">{perfume.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{perfume.brandName}</p>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {perfume.description}
                </p>
                
                <a 
                  href={`/perfumes/${perfume.id}`}
                  className="mt-3 inline-block text-blue-500 hover:underline"
                >
                  자세히 보기 →
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">향수가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfumeList;