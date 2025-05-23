'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TraitScores } from '@/app/types/perfume';

interface TraitRadarChartProps {
  traits: TraitScores;
  title?: string;
  showAnimation?: boolean;
}

const TraitRadarChart: React.FC<TraitRadarChartProps> = ({
  traits,
  title = '특성 프로필',
  showAnimation = true
}) => {
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const maxValue = 10;
  
  // 특성 항목 배열로 변환
  const characteristics = Object.entries(traits).map(([key, value]) => ({
    key,
    label: getTraitLabel(key as keyof TraitScores),
    value
  }));
  
  // 가장 높은 점수를 가진 특성 찾기
  const highestTrait = [...characteristics].sort((a, b) => b.value - a.value)[0];
  
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
    const isHighest = char.key === highestTrait.key;
    if (isHighest) { // 가장 높은 특성이면
      return null; // 축선을 그리지 않음
    }
    return <motion.line 
      key={`axis-${i}`} 
      x1={centerX} 
      y1={centerY} 
      x2={x} 
      y2={y} 
      stroke={"#ddd"} // 일반 축선 스타일
      strokeWidth={"1"}
      strokeDasharray={"2,2"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />;
  });
  
  // 그리드 원 생성
  const gridCircles = Array.from({ length: 5 }).map((_, i) => {
    const gridRadius = (radius * (i + 1)) / 5;
    return (
      <motion.circle
        key={`grid-${i}`}
        cx={centerX}
        cy={centerY}
        r={gridRadius}
        fill="none"
        stroke="#ddd"
        strokeWidth="1"
        strokeDasharray="2,2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 * i }}
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
  
  // 아이콘 매핑
  const iconMap: Record<string, string> = {
    'sexy': '💋',
    'cute': '🌸',
    'charisma': '✨',
    'darkness': '🌑',
    'freshness': '🌊',
    'elegance': '🦢',
    'freedom': '🕊️',
    'luxury': '💎',
    'purity': '✨',
    'uniqueness': '🌈'
  };
  
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
  
  const WrapperComponent = showAnimation ? motion.div : 'div';
  
  // AI 감탄 문구 생성
  const getAiMessage = (trait: string, value: number) => {
    const messages = {
      sexy: '어머머! 이런 섹시함은 불법이야!! 보는 사람 심장 떨어지겠네요! 🔥🔥',
      cute: '헐랭! 귀여움 폭격기 등장! 세상에 이런 큐티뽀짝이 또 있을까요?! 😍',
      charisma: '와우! 당신의 최애는 진짜 카리스마 폭발! 눈빛만으로 세상 정복가능해요! 👑',
      darkness: '오마이갓! 이 다크한 매력은 뭐죠? 심쿵사 당할 뻔했어요! 🖤',
      freshness: '우와아! 이 청량감은 실화냐?! 민트초코처럼 중독적이에요! 🌊',
      elegance: '어멋! 당신의 최애는 너무 골~~~져스!!!! 지져스! 당신 최애만큼 여왕이라는 단어에 어울릴 사람은 없네요! 👑',
      freedom: '헉! 이런 자유로움은 처음 봐요! 구속할 수 없는 영혼의 소유자네요! 🕊️',
      luxury: '엄마야! 럭셔리한 오라가 폭발해서 제 핸드폰이 명품으로 바뀔 뻔! 💎',
      purity: '에구머니! 이런 순수함은 국가에서 보호해야해요! 천사가 따로 없네요! 😇',
      uniqueness: '이런 독특함은 특허내야 해요! 진짜 세상에 하나밖에 없는 매력이에요! 🦄'
    };
    
    return messages[trait as keyof typeof messages] || '와우! 이런 매력은 처음 봐요! 정말 놀라워요! ✨';
  };
  
  return (
    <WrapperComponent
      {...(showAnimation ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 }
      } : {})}
      className="flex flex-col items-center my-4 p-5 bg-gradient-to-br from-yellow-50 to-pink-50 rounded-xl border border-pink-200 w-full relative z-10"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      
      {/* 가장 높은 점수 특성에 대한 AI 주접 멘트 */}
      {highestTrait && (
        <div className="w-full bg-pink-100 rounded-lg p-3 mb-1 relative overflow-hidden">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white mr-2">
              <span role="img" aria-label="AI">🤖</span>
            </div>
            <p className="text-sm font-medium text-pink-900 italic leading-snug">
              "{getAiMessage(highestTrait.key, highestTrait.value)}"
            </p>
          </div>
          <div className="absolute right-2 bottom-1">
            <span className="text-xs font-bold text-pink-500">AI 주접봇</span>
          </div>
        </div>
      )}
      
      <svg width="290" height="290" viewBox="0 0 300 300" className="mb-1">
        {/* 그리드 및 축 */}
        {gridCircles}
        {axisLines}
        
        {/* 데이터 다각형 */}
        {showAnimation ? (
          <motion.path
            d={createPath()}
            fill="rgba(255, 182, 193, 0.5)"
            stroke="#ff9eb5"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        ) : (
          <path
            d={createPath()}
            fill="rgba(255, 182, 193, 0.5)"
            stroke="#ff9eb5"
            strokeWidth="2"
          />
        )}
        
        {/* 레이블 */}
        {labels}
        
        {/* 데이터 포인트 */}
        {characteristics.map((char, i) => {
          const { x, y } = getCoordinates(char.value, i);
          
          if (showAnimation) {
            return (
              <motion.circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={"#ff9eb5"}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.05 }}
              />
            );
          } else {
            return (
              <circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={"#ff9eb5"}
              />
            );
          }
        })}
      </svg>
      
      {/* 특성 값 목록 (작은 배지 형태) */}
      <div className="flex flex-wrap gap-2 justify-center p-1.5 bg-white bg-opacity-50 rounded-xl w-full">
        {characteristics.map((char, i) => {
          return (
            <div 
              key={`badge-${i}`} 
              className={`px-2 py-1 bg-white border-pink-200 rounded-full text-xs border flex items-center gap-1`}
            >
              <span>{iconMap[char.key] || '✨'}</span>
              <span className="font-medium text-gray-800">
                {char.label}: {char.value}
              </span>
            </div>
          );
        })}
      </div>
    </WrapperComponent>
  );
};

export default TraitRadarChart; 