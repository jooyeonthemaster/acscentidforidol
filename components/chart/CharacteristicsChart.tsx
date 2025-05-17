"use client";

import React from 'react';
import { motion } from 'framer-motion';

type Characteristic = {
  label: string;
  userValue: number;
  aiValue?: number;
};

type CharacteristicsChartProps = {
  characteristics: Characteristic[];
  title: string;
  maxValue?: number;
  showComparison?: boolean;
};

export const CharacteristicsChart: React.FC<CharacteristicsChartProps> = ({
  characteristics,
  title,
  maxValue = 10,
  showComparison = false
}) => {
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  
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
  const createPath = (dataKey: 'userValue' | 'aiValue') => {
    const points = characteristics.map((char, i) => {
      const value = char[dataKey] || 0;
      const { x, y } = getCoordinates(value, i);
      return `${x},${y}`;
    });
    return `M${points.join(' L')} Z`;
  };
  
  // 축 경로 생성
  const axisLines = characteristics.map((_, i) => {
    const { x, y } = getCoordinates(maxValue, i);
    return <line key={`axis-${i}`} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#ddd" strokeWidth="1" />;
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
        fontSize="10"
        fontWeight="bold"
        fill="#666"
      >
        {char.label}
      </text>
    );
  });
  
  // 아이콘 매핑 (간단한 예시)
  const iconMap: Record<string, string> = {
    '섹시함': '💋',
    '귀여움': '🌸',
    '카리스마': '✨',
    '다크함': '🌑',
    '청량함': '🌊',
    '우아함': '🦢',
    '자유로움': '🕊️',
    '럭셔리함': '💎',
    '순수함': '✨',
    '독특함': '🌈'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center my-4 p-4 bg-gradient-to-br from-yellow-50 to-pink-50 rounded-xl border-2 border-dashed border-pink-200 w-full max-w-[90%]"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* 그리드 및 축 */}
        {gridCircles}
        {axisLines}
        
        {/* 사용자 데이터 다각형 */}
        <motion.path
          d={createPath('userValue')}
          fill="rgba(255, 182, 193, 0.5)"
          stroke="#ff9eb5"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        
        {/* AI 데이터 다각형 (비교 모드일 때만) */}
        {showComparison && (
          <motion.path
            d={createPath('aiValue')}
            fill="rgba(173, 216, 230, 0.5)"
            stroke="#79b4d2"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        )}
        
        {/* 레이블 */}
        {labels}
        
        {/* 데이터 포인트 */}
        {characteristics.map((char, i) => {
          const { x, y } = getCoordinates(char.userValue, i);
          return (
            <motion.circle
              key={`user-point-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill="#ff9eb5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05 }}
            />
          );
        })}
        
        {showComparison && characteristics.map((char, i) => {
          if (!char.aiValue) return null;
          const { x, y } = getCoordinates(char.aiValue, i);
          return (
            <motion.circle
              key={`ai-point-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill="#79b4d2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 + i * 0.05 }}
            />
          );
        })}
      </svg>
      
      {/* 범례 */}
      {showComparison && (
        <div className="flex gap-4 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-300 rounded-full mr-1"></div>
            <span className="text-xs">당신의 생각</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-300 rounded-full mr-1"></div>
            <span className="text-xs">AI 분석</span>
          </div>
        </div>
      )}
      
      {/* 특성 값 목록 (작은 배지 형태) */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {characteristics.map((char, i) => (
          <div 
            key={`badge-${i}`} 
            className="px-2 py-1 bg-white rounded-full text-xs border border-pink-200 flex items-center gap-1 shadow-sm"
          >
            <span>{iconMap[char.label] || '✨'}</span>
            <span className="font-medium">{char.label}: {char.userValue}</span>
            {showComparison && char.aiValue !== undefined && (
              <span className="text-blue-500">→ {char.aiValue}</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CharacteristicsChart;