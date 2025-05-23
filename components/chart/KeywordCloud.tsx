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
    const baseFontSize = 0.7; // rem 단위
    return `${baseFontSize + (weight * 0.15)}rem`; // 가중치에 따라 크기 증가 (더 작은 증가폭)
  };
  
  // 무작위 위치 계산 (겹침 방지 로직 없음, 실제 구현 시 더 복잡한 알고리즘 필요)
  const getRandomPosition = (index: number, length: number) => {
    // 시드값을 고정시켜 항상 같은 결과가 나오도록 함
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // 박스 경계 안에 키워드가 항상 있도록 여백 더 추가
    const padding = 10; // 경계에서 여백 늘림
    const minX = padding;
    const maxX = 100 - padding;
    const minY = padding + 10; // Y축 시작점을 이전보다 위로 (분산 목적)
    const maxY = 100 - padding - 10; // Y축 끝점을 이전보다 아래로 (분산 목적)
    
    // 안전한 위치 계산
    const getSafePosition = () => {
      // 균등한 분포를 위해 그리드 기반으로 나눔
      const gridSize = Math.ceil(Math.sqrt(length * 0.5)); // 좀 더 여유있게
      const cellWidth = (maxX - minX) / gridSize;
      const cellHeight = (maxY - minY) / gridSize;
      
      // 그리드 셀 좌표 계산
      const row = Math.floor(index / gridSize) % gridSize;
      const col = index % gridSize;
      
      // 각 셀 내에서의 위치에 랜덤성 부여
      const cellX = minX + (col * cellWidth) + (seededRandom(index * 2) * cellWidth * 0.6);
      const cellY = minY + (row * cellHeight) + (seededRandom(index * 3) * cellHeight); // Y축 랜덤 범위 최대화
      
      // 경계 검사 및 수정
      const x = Math.max(minX, Math.min(maxX, cellX));
      const y = Math.max(minY, Math.min(maxY, cellY));
      
      return { x, y };
    };
    
    return getSafePosition();
  };
  
  const WrapperComponent = showAnimation ? motion.div : 'div';
  
  return (
    <WrapperComponent
      {...(showAnimation ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 }
      } : {})}
      className="flex flex-col items-center my-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 w-full"
    >
      <div className="relative w-full h-30 bg-white rounded-lg p-6 shadow-sm">
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
                className="whitespace-nowrap font-medium px-2.5 py-1.5 rounded-full inline-block"
                style={{ 
                  fontSize: getFontSize(keyword.weight),
                  color: keyword.color,
                  backgroundColor: `${keyword.color}20`, // 20% 투명도
                  borderColor: `${keyword.color}40`, // 40% 투명도
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {keyword.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </WrapperComponent>
  );
};

export default KeywordCloud; 