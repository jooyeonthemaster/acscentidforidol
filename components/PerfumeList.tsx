import React from 'react';
import { Perfume, PerfumeCategory } from '../types/perfume';
import PerfumeCard from './PerfumeCard';
import { getCategoryKoreanName } from '../utils/perfumeUtils';

interface PerfumeListProps {
  perfumes: Perfume[];
  selectedCategory?: PerfumeCategory;
  onCategorySelect?: (category: PerfumeCategory | undefined) => void;
}

const PerfumeList: React.FC<PerfumeListProps> = ({ 
  perfumes, 
  selectedCategory, 
  onCategorySelect 
}) => {
  // 모든 카테고리 목록
  const categories: PerfumeCategory[] = ['citrus', 'floral', 'woody', 'musk', 'fruity', 'spicy'];
  
  // 선택된 카테고리에 따라 향수 필터링
  const filteredPerfumes = selectedCategory 
    ? perfumes.filter(perfume => perfume.category === selectedCategory)
    : perfumes;

  return (
    <div>
      {/* 카테고리 필터 버튼 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded ${selectedCategory === undefined ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onCategorySelect && onCategorySelect(undefined)}
        >
          전체
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => onCategorySelect && onCategorySelect(category)}
          >
            {getCategoryKoreanName(category)} 계열
          </button>
        ))}
      </div>
      
      {/* 향수 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPerfumes.map(perfume => (
          <PerfumeCard key={perfume.id} perfume={perfume} />
        ))}
      </div>
      
      {/* 결과가 없을 경우 */}
      {filteredPerfumes.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">해당 카테고리의 향수가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default PerfumeList;