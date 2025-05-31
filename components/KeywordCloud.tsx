'use client';

import React from 'react';

interface KeywordCloudProps {
  keywords: string[];
  scattered?: boolean; // 자유분방한 배치 옵션
  minFontSize?: number; // 최소 폰트 크기 (em)
  maxFontSize?: number; // 최대 폰트 크기 (em)
  spreadRange?: number; // 분포 범위 (0-100)
  minDistance?: number; // 키워드 간 최소 거리
}

const KeywordCloud: React.FC<KeywordCloudProps> = ({ 
  keywords, 
  scattered = false,
  minFontSize = 0.5,
  maxFontSize = 0.8,
  spreadRange = 60,
  minDistance = 25
}) => {
  // 키워드 하나의 배경색 랜덤 선택 (높은 투명도)
  const getRandomColor = () => {
    const colors = [
      'rgba(254, 240, 138, 0.6)', // yellow-100 with higher opacity
      'rgba(219, 234, 254, 0.6)', // blue-100 with higher opacity
      'rgba(220, 252, 231, 0.6)', // green-100 with higher opacity
      'rgba(252, 231, 243, 0.6)', // pink-100 with higher opacity
      'rgba(243, 232, 255, 0.6)', // purple-100 with higher opacity
      'rgba(255, 237, 213, 0.6)', // orange-100 with higher opacity
      'rgba(204, 251, 241, 0.6)', // teal-100 with higher opacity
      'rgba(224, 231, 255, 0.6)', // indigo-100 with higher opacity
      'rgba(254, 226, 226, 0.6)'  // red-100 with higher opacity
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 모든 키워드에 대한 색상을 고정하기 위해 메모이제이션
  const keywordColors = React.useMemo(() => {
    return keywords.reduce((acc, keyword) => {
      acc[keyword] = getRandomColor();
      return acc;
    }, {} as Record<string, string>);
  }, [keywords]);

  // 자유분방한 배치를 위한 위치 생성 (겹침 방지)
  const keywordPositions = React.useMemo(() => {
    if (!scattered) return [];
    
    const positions: Array<{top: number, left: number, fontSize: number}> = [];
    const minDistanceValue = minDistance; // props에서 받은 값 사용
    
    for (let i = 0; i < keywords.length; i++) {
      let attempts = 0;
      let newPosition: {top: number, left: number, fontSize: number};
      
      do {
        newPosition = {
          top: Math.random() * spreadRange + (100 - spreadRange) / 2, // 동적 범위
          left: Math.random() * spreadRange + (100 - spreadRange) / 2, // 동적 범위
          fontSize: Math.random() * (maxFontSize - minFontSize) + minFontSize, // 동적 크기
        };
        attempts++;
      } while (
        attempts < 80 && // 최대 80번 시도 (더 좋은 위치 찾기)
        positions.some(pos => {
          const distance = Math.sqrt(
            Math.pow(pos.top - newPosition.top, 2) + 
            Math.pow(pos.left - newPosition.left, 2)
          );
          return distance < minDistanceValue;
        })
      );
      
      positions.push(newPosition);
    }
    
    return positions;
  }, [keywords, scattered, minFontSize, maxFontSize, spreadRange, minDistance]);
  
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        키워드가 없습니다
      </div>
    );
  }

  if (scattered) {
    return (
      <div className="relative w-full h-full">
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className="px-2 py-1 rounded-full font-medium text-gray-800 shadow-sm absolute whitespace-nowrap"
            style={{
              backgroundColor: keywordColors[keyword],
              top: `${keywordPositions[index]?.top}%`,
              left: `${keywordPositions[index]?.left}%`,
              fontSize: `${keywordPositions[index]?.fontSize}em`,
              transform: 'translate(-50%, -50%)', // 중앙 정렬
            }}
          >
            {keyword}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div
          key={index}
          className={`${keywordColors[keyword]} px-3 py-1 rounded-full text-sm font-medium text-gray-800 shadow-sm`}
        >
          {keyword}
        </div>
      ))}
    </div>
  );
};

export default KeywordCloud; 