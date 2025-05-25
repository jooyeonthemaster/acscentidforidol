'use client';

import React from 'react';
import { TraitScores } from '@/app/types/perfume';

interface SimpleRadarChartProps {
  traits: TraitScores;
  size?: number;
}

const SimpleRadarChart: React.FC<SimpleRadarChartProps> = ({ 
  traits, 
  size = 150 
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 20; // 여백 확보
  const maxValue = 10;
  
  // 특성 항목 배열로 변환
  const characteristics = Object.entries(traits).map(([key, value]) => ({
    key,
    label: getTraitLabel(key as keyof TraitScores),
    value
  }));
  
  // 각 특성의 각도 계산
  const angleStep = (Math.PI * 2) / characteristics.length;
  
  // 값에 따른 좌표 계산 함수
  const getCoordinates = (value: number, index: number) => {
    const normalizedValue = value / maxValue; // 0~1 사이 값으로 정규화
    const angle = index * angleStep - Math.PI / 2; // 시작점을 12시 방향으로 조정
    const x = centerX + radius * normalizedValue * Math.cos(angle);
    const y = centerY + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };
  
  // 다각형 경로 생성
  const createPath = () => {
    const points = characteristics.map((char, i) => {
      const { x, y } = getCoordinates(char.value, i);
      return `${x},${y}`;
    });
    return `M${points.join(' L')} Z`;
  };
  
  // 축 경로 생성
  const axisLines = characteristics.map((char, i) => {
    const { x, y } = getCoordinates(maxValue, i);
    return (
      <line 
        key={`axis-${i}`} 
        x1={centerX} 
        y1={centerY} 
        x2={x} 
        y2={y} 
        stroke="#ddd" 
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  });
  
  // 그리드 원 생성
  const gridCircles = Array.from({ length: 5 }).map((_, i) => {
    const gridRadius = (radius * (i + 1)) / 5;
    return (
      <circle
        key={`grid-${i}`}
        cx={centerX}
        cy={centerY}
        r={gridRadius}
        fill="none"
        stroke="#ddd"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    );
  });
  
  // 레이블 생성
  const labels = characteristics.map((char, i) => {
    const { x, y } = getCoordinates(maxValue * 1.15, i); // 레이블은 약간 바깥에 위치
    return (
      <text
        key={`label-${i}`}
        x={x}
        y={y}
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#666"
      >
        {char.label}
      </text>
    );
  });
  
  // 특성 레이블 가져오기
  function getTraitLabel(trait: keyof TraitScores): string {
    const traitNames: Record<keyof TraitScores, string> = {
      sexy: '섹시함',
      cute: '귀여움',
      charisma: '카리스마',
      darkness: '다크함',
      freshness: '청량함',
      elegance: '우아함',
      freedom: '자유로움',
      luxury: '럭셔리함',
      purity: '순수함',
      uniqueness: '독특함'
    };
    
    return traitNames[trait];
  }
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 그리드 및 축 */}
      {gridCircles}
      {axisLines}
      
      {/* 데이터 다각형 */}
      <path
        d={createPath()}
        fill="rgba(255, 182, 193, 0.5)"
        stroke="#ff9eb5"
        strokeWidth="2"
      />
      
      {/* 레이블 */}
      {labels}
      
      {/* 데이터 포인트 */}
      {characteristics.map((char, i) => {
        const { x, y } = getCoordinates(char.value, i);
        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r={3}
            fill="#ff9eb5"
          />
        );
      })}
    </svg>
  );
};

export default SimpleRadarChart; 