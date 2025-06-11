'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TraitScores } from '@/app/types/perfume';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

interface TraitRadarChartProps {
  traits: TraitScores;
  title?: string;
  showAnimation?: boolean;
}

const TraitRadarChart: React.FC<TraitRadarChartProps> = ({
  traits,
  title,
  showAnimation = true
}) => {
  const { t, currentLanguage } = useTranslationContext();
  const displayTitle = title || t('result.traitProfile');
  
  // 번역된 메시지 상태
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string[]>>({});
  
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
  
  // 원본 한국어 메시지들
  const originalMessages: Record<string, string[]> = {
    sexy: [
      "오마이갓! 이 섹시함은 뭐죠? 화면이 녹아내려요! 🔥💋",
      "세상에... 이 농염한 매력에 심장이 두근두근! 너무 섹시해요! 😍✨",
      "아니 이게 뭐야! 이런 치명적인 섹시함은 처음 봐요! 완전 킬링포인트! 💋🔥",
      "허걱! 이 섹시한 오라에 현기증이... 정말 매혹적이에요! 😱💕"
    ],
    cute: [
      "와아악! 이 귀여움 뭐야뭐야? 심장이 사르르 녹아요! 🥺💕",
      "큐큐큐큐! 이런 큐트함은 반칙이야! 너무너무 사랑스러워요! 🌸✨",
      "아이고야! 이 순수한 큐트함에 눈물까지... 천사가 따로 없어요! 🥰💖",
      "헉! 이 사랑스러운 매력에 완전 홀렸어요! 큐티뽀짝! 🌸🦋"
    ],
    charisma: [
      "오오오! 이 카리스마 뭐예요? 완전 압도적인데요! 👑✨",
      "와! 이런 강력한 카리스마는 처음 봐요! 포스가 장난 아니에요! 🔥⚡",
      "헉! 이 카리스마에 완전 압도당했어요! 진짜 레전드급! 👑🌟",
      "세상에! 이런 임팩트 있는 카리스마... 정말 대단해요! 🔥👑"
    ],
    darkness: [
      "어머머! 이 다크한 매력... 너무 신비로워요! 🌙🖤",
      "오마이갓! 이 깊고 어두운 눈빛에 완전 빠져버렸어요! 🌑✨",
      "허걱! 이런 미스테리어스한 분위기... 정말 매혹적이에요! 🖤🌙",
      "세상에! 이 다크 카리스마에 심장이 쿵쾅쿵쾅! 너무 멋져요! 🌑💫"
    ],
    freshness: [
      "와아! 이 상큼함 뭐예요? 완전 프레시해요! 🌊💙",
      "헉! 이런 청량한 매력에 기분까지 상쾌해져요! 🌿✨",
      "오마이! 이 프레시한 에너지에 완전 힐링받아요! 🌊🌸",
      "와우! 이런 상큼발랄함... 정말 싱그러워요! 🌿💚"
    ],
    elegance: [
      "오! 이 우아함 보세요! 완전 고급스러워요! 🦢✨",
      "와아! 이런 엘레간트한 매력... 정말 품격 있어요! 💎👑",
      "헉! 이 세련된 분위기에 완전 매료됐어요! 🦢💫",
      "세상에! 이런 클래시한 우아함... 진짜 멋져요! ✨👑"
    ],
    freedom: [
      "와우! 이 자유로운 에너지 느껴져요! 너무 멋져요! 🕊️🌈",
      "오마이! 이런 자유분방한 매력... 정말 시원해요! 🌊🦋",
      "헉! 이 무구속한 분위기에 완전 해방감 느껴져요! 🕊️✨",
      "세상에! 이런 자유로운 영혼... 너무 아름다워요! 🌈💫"
    ],
    luxury: [
      "오마이갓! 이 럭셔리함 뭐예요? 완전 고급져요! 💎👑",
      "와아! 이런 사치스러운 매력... 진짜 프리미엄이에요! ✨💰",
      "헉! 이 고급스러운 분위기에 완전 압도됐어요! 💎🌟",
      "세상에! 이런 럭셔리한 오라... 정말 화려해요! 👑💫"
    ],
    purity: [
      "와아! 이 순수함 보세요! 완전 천사 같아요! 🤍✨",
      "오마이! 이런 청순한 매력... 너무 맑고 깨끗해요! 🕊️💙",
      "헉! 이 순결한 분위기에 마음이 정화돼요! 🤍🌸",
      "세상에! 이런 순수한 영혼... 정말 아름다워요! ✨🦋"
    ],
    uniqueness: [
      "와우! 이 독특함 뭐예요? 완전 개성 넘쳐요! 🌈✨",
      "오마이갓! 이런 유니크한 매력... 진짜 특별해요! 🦄💫",
      "헉! 이 독창적인 분위기에 완전 매료됐어요! 🌟🎨",
      "세상에! 이런 오리지널한 개성... 너무 멋져요! 🌈🔥"
    ]
  };
  
  // 동적 콘텐츠 번역 함수
  const translateDynamicContent = async (messages: Record<string, string[]>) => {
    if (currentLanguage === 'ko') {
      setTranslatedMessages(messages);
      return;
    }

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'translateMessages',
          messages,
          targetLanguage: currentLanguage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedMessages(data.translatedMessages || messages);
      } else {
        console.error('번역 실패');
        setTranslatedMessages(messages);
      }
    } catch (error) {
      console.error('번역 오류:', error);
      setTranslatedMessages(messages);
    }
  };

  // 언어 변경 시 번역 수행
  useEffect(() => {
    translateDynamicContent(originalMessages);
  }, [currentLanguage]);

  // 초기 로드 시 번역 수행
  useEffect(() => {
    if (Object.keys(translatedMessages).length === 0) {
      translateDynamicContent(originalMessages);
    }
  }, []);
  
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
  
  // 특성 레이블 가져오기 (번역 적용)
  function getTraitLabel(trait: keyof TraitScores): string {
    return t(`trait.${trait}`);
  }
  
  const WrapperComponent = showAnimation ? motion.div : 'div';
  
  // AI 감탄 문구 생성 (번역된 메시지 사용)
  const getAiMessage = (trait: string, value: number) => {
    const traitMessages = translatedMessages[trait] || originalMessages[trait] || [
      "와우! 이런 매력은 처음 봐요! 정말 놀라워요! ✨",
      "오마이갓! 완전 대박이에요! 너무 멋져요! 🔥",
      "헉! 이런 특별함... 정말 독특해요! 💫",
      "세상에! 이런 개성... 진짜 인상적이에요! 🌟"
    ];

    // 점수에 따라 다른 메시지 선택 (높을수록 더 극찬)
    const messageIndex = Math.min(Math.floor(value / 3), traitMessages.length - 1);
    return traitMessages[messageIndex];
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
      <h3 className="text-lg font-bold text-gray-800 mb-2">{displayTitle}</h3>
      
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
            <span className="text-xs font-bold text-pink-500">{t('chart.aiBot')}</span>
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