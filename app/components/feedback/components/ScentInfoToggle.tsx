import React, { useState } from 'react';
import { PerfumeFeedback, ScentMixture } from '@/app/types/perfume';
import { formatScentCode } from '../utils/formatters'; // 수정된 경로
import { getScentCategory } from '../utils/scentUtils'; // 새로 추가된 import

// 카테고리별 특성 정보를 반환하는 함수
const getCategoryCharacteristics = (category: string): {
  description: string;
  effect: string;
  personality: string;
  bestWith: string[];
} => {
  const characteristics: Record<string, {
    description: string;
    effect: string;
    personality: string;
    bestWith: string[];
  }> = {
    citrus: {
      description: '상쾌하고 활기찬 향으로, 베르가못, 레몬, 오렌지 등의 향이 포함됩니다',
      effect: '기분을 상쾌하게 하고 활기를 불어넣는 효과가 있습니다',
      personality: '밝고 경쾌한 성격의 향',
      bestWith: ['floral', 'woody']
    },
    floral: {
      description: '꽃의 향기가 주를 이루며, 로즈, 자스민, 튤립 등의 향이 포함됩니다',
      effect: '부드럽고 로맨틱한 분위기를 연출하며 여성스러운 느낌을 줍니다',
      personality: '우아하고 세련된 성격의 향',
      bestWith: ['citrus', 'fruity']
    },
    woody: {
      description: '나무와 흙의 향을 담고 있으며, 샌달우드, 시더우드 등이 특징적입니다',
      effect: '안정감과 깊이감을 더해주며 자연적인 느낌을 강화합니다',
      personality: '차분하고 묵직한 성격의 향',
      bestWith: ['musky', 'spicy']
    },
    musky: {
      description: '포근하고 관능적인 향으로, 머스크, 앰버, 바닐라 등이 주요합니다',
      effect: '향수에 깊이와 지속력을 더하며 편안한 잔향을 남깁니다',
      personality: '따뜻하고 포근한 성격의 향',
      bestWith: ['woody', 'spicy']
    },
    fruity: {
      description: '달콤하고 즙이 많은 과일 향으로, 복숭아, 딸기, 블랙베리 등이 특징적입니다',
      effect: '생기와 달콤함을 더해주며 젊고 발랄한 느낌을 줍니다',
      personality: '명랑하고 달콤한 성격의 향',
      bestWith: ['floral', 'citrus']
    },
    spicy: {
      description: '자극적이고 강렬한 향으로, 핑크페퍼, 블랙페퍼, 진저 등이 포함됩니다',
      effect: '향수에 독특함과 매력적인 강렬함을 더합니다',
      personality: '강렬하고 개성있는 성격의 향',
      bestWith: ['woody', 'musky']
    }
  };
  
  return characteristics[category] || {
    description: '독특한 향으로 다양한 특성을 가지고 있습니다',
    effect: '향수에 특별한 개성을 더합니다',
    personality: '독특하고 특별한 성격의 향',
    bestWith: []
  };
};

// 향료 ID에서 카테고리 추정 (삭제)
/*
const getScentCategory = (id: string): string => {
  // ... (내용 생략) ...
};
*/

interface ScentInfoToggleProps {
  title: string;
  content: string;
}

const ScentInfoToggle: React.FC<ScentInfoToggleProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-md text-sm text-amber-800 transition-colors"
      >
        <span>{isOpen ? title.replace('펼치기', '접기') : title}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-amber-50 rounded-md text-sm text-amber-900 border border-amber-200">
          {/* content를 문단별로 나누어 표시 (개행 문자 기준) */}
          {content.split('\n').map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-2" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScentInfoToggle; 