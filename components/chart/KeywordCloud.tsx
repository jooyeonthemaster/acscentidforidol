'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KeywordCloudProps {
  keywords: string[];
  title?: string;
  showAnimation?: boolean;
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({
  keywords,
  title = '키워드',
  showAnimation = true
}) => {
  // 고정된 색상 배열
  const colors = [
    '#FF9EB5', // 핑크
    '#FF6B8B', // 짙은 핑크
    '#A5D8F3', // 하늘색
    '#9B8EE8', // 보라색
    '#FFD166', // 노란색
    '#67C23A', // 초록색
    '#E67E22', // 주황색
    '#16A085', // 청록색
    '#8E44AD'  // 자주색
  ];
  
  // 키워드 가중치 설정 (이 예제에서는 랜덤하게 가중치 할당)
  // 실제로는 키워드 빈도나 중요도 등을 기반으로 계산할 수 있음
  const getWeightedKeywords = () => {
    // 시드값을 고정시켜 항상 같은 결과가 나오도록 함
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    return keywords.map((keyword, index) => {
      // 각 키워드마다 고유한 시드값 사용
      const weight = Math.floor(seededRandom(index) * 3) + 1; // 1부터 3까지의 가중치
      const colorIndex = Math.floor(seededRandom(index + 100) * colors.length);
      
      return {
        text: keyword,
        weight,
        color: colors[colorIndex]
      };
    });
  };
  
  const weightedKeywords = getWeightedKeywords();
  
  // 가중치에 따른 폰트 크기 계산
  const getFontSize = (weight: number) => {
    const baseFontSize = 0.8; // rem 단위
    return `${baseFontSize + (weight * 0.2)}rem`; // 가중치에 따라 크기 증가
  };
  
  // 무작위 위치 계산 (겹침 방지 로직 없음, 실제 구현 시 더 복잡한 알고리즘 필요)
  const getRandomPosition = (index: number, length: number) => {
    // 시드값을 고정시켜 항상 같은 결과가 나오도록 함
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    const section = Math.floor(index / (length / 5)); // 0~4 섹션으로 나눔
    const sectionWidth = 100 / 5; // 각 섹션의 너비 (%)
    
    // 섹션 내 랜덤 위치 계산
    const minX = section * sectionWidth;
    const maxX = (section + 1) * sectionWidth - 20; // 단어 최대 길이 고려
    
    const x = minX + (seededRandom(index * 2) * (maxX - minX));
    const y = 10 + (seededRandom(index * 3) * 80); // 10%~90% 사이
    
    return { x, y };
  };
  
  const WrapperComponent = showAnimation ? motion.div : 'div';
  
  return (
    <WrapperComponent
      {...(showAnimation ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 }
      } : {})}
      className="flex flex-col items-center my-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 w-full"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="relative w-full h-60 bg-white rounded-lg p-4 shadow-sm">
        {weightedKeywords.map((keyword, index) => {
          const position = getRandomPosition(index, weightedKeywords.length);
          
          return (
            <motion.div
              key={`keyword-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
              initial={showAnimation ? { scale: 0, opacity: 0 } : undefined}
              animate={showAnimation ? { scale: 1, opacity: 1 } : undefined}
              transition={{ 
                delay: showAnimation ? 0.1 + (index * 0.05) : 0,
                type: 'spring',
                stiffness: 100
              }}
            >
              <span 
                className="whitespace-nowrap font-medium px-2 py-1 rounded-full"
                style={{ 
                  fontSize: getFontSize(keyword.weight),
                  color: keyword.color,
                  backgroundColor: `${keyword.color}20`, // 20% 투명도
                  borderColor: `${keyword.color}40`, // 40% 투명도
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {keyword.text}
              </span>
            </motion.div>
          );
        })}
      </div>
      
      {/* 범례 */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-300 mr-1"></div>
          <span className="text-xs text-gray-500">낮은 연관성</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-500 mr-1"></div>
          <span className="text-xs text-gray-500">중간 연관성</span>
        </div>
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-gray-700 mr-1"></div>
          <span className="text-xs text-gray-500">높은 연관성</span>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default KeywordCloud; 