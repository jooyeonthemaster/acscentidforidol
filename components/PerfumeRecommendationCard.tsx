'use client';

import React from 'react';
import { PerfumePersona } from '../types/perfume';

interface PerfumeRecommendationCardProps {
  perfume: {
    persona: PerfumePersona;
    score: number;
    matchReason: string;
  };
  rank: number;
}

const PerfumeRecommendationCard: React.FC<PerfumeRecommendationCardProps> = ({ perfume, rank }) => {
  // 순위 배지 색상 처리
  const getBadgeColor = () => {
    switch(rank) {
      case 1: return 'bg-yellow-400 text-gray-900';
      case 2: return 'bg-gray-300 text-gray-900';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };
  
  // 순위 표시 텍스트
  const getRankText = () => {
    switch(rank) {
      case 1: return '1위';
      case 2: return '2위';
      case 3: return '3위';
      default: return `${rank}위`;
    }
  };
  
  // 매칭 점수 백분율로 표시
  const matchPercentage = Math.round(perfume.score * 100);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md relative">
      {/* 순위 배지 */}
      <div className={`absolute -top-3 -right-3 ${getBadgeColor()} w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md`}>
        {getRankText()}
      </div>
      
      <div className="flex space-x-4">
        {/* 향수 컬러 바 */}
        <div 
          className="w-2 h-full min-h-[80px] rounded-full" 
          style={{ backgroundColor: perfume.persona.primaryColor }}
        />
        
        <div className="flex-1">
          {/* 향수 이름 및 매칭률 */}
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-900">{perfume.persona.name}</h4>
            <span className="text-sm font-medium text-green-600">매칭률 {matchPercentage}%</span>
          </div>
          
          {/* 향수 설명 */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {perfume.persona.description.substring(0, 100)}...
          </p>
          
          {/* 매칭 이유 */}
          <div className="text-xs text-gray-500">
            <span className="font-medium">추천 이유:</span> {perfume.matchReason}
          </div>
          
          {/* 향수 태그 */}
          <div className="flex flex-wrap gap-1 mt-2">
            {perfume.persona.keywords.slice(0, 3).map((keyword, index) => (
              <span 
                key={index} 
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeRecommendationCard; 