"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Doughnut } from 'react-chartjs-2';
import { CustomPerfumeRecipe, PerfumeFeedback, PerfumeCategory, CategoryPreference } from '@/app/types/perfume';
import { CHARACTERISTIC_NAMES } from '../constants/characteristics';
import { characteristicToSliderValue } from '../constants/characteristics';
import { formatScentCode, formatScentDisplay, findScentNameById } from '../utils/formatters';

interface SuccessViewProps {
  feedback: PerfumeFeedback;
  recipe: CustomPerfumeRecipe | null;
  customizationLoading: boolean;
  onClose: () => void;
}

// 향료 알갱이 아이콘 컴포넌트
const GranuleIcon = ({ index, scentName }: { index: number; scentName: string }) => {
  // 향료별로 다른 색상 부여
  const getGradient = () => {
    const gradients = [
      'from-amber-200 to-amber-400',
      'from-blue-200 to-blue-400',
      'from-pink-200 to-pink-400',
      'from-green-200 to-green-400',
      'from-purple-200 to-purple-400'
    ];
    
    // 향료 이름 기반으로 고정 색상 할당 (같은 향료는 항상 같은 색상)
    const nameHash = scentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[nameHash % gradients.length];
  };
  
  return (
    <div 
      className={`w-6 h-6 rounded-full bg-gradient-to-r ${getGradient()} flex items-center justify-center text-xs shadow-sm border border-white`}
      title={`${scentName} 향료 알갱이 #${index + 1}`}
    >
      {index + 1}
    </div>
  );
};

// 테스트용 향료 데이터 인터페이스
interface ScentMixture {
  id: string;
  name: string;
  count: number;
  ratio: number;
}

// 향료 정보 토글 컴포넌트
const ScentInfoToggle = ({ 
  scent, 
  feedback 
}: { 
  scent: ScentMixture; 
  feedback: PerfumeFeedback 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
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
  
  // 향료 ID에서 카테고리 추정 (개선된 버전)
  const getScentCategory = (id: string): string => {
    // ID 형식에 따른 카테고리 매핑
    if (id.startsWith('CI-')) return 'citrus';
    if (id.startsWith('FL-')) return 'floral';
    if (id.startsWith('WD-')) return 'woody';
    if (id.startsWith('MU-')) return 'musky';
    if (id.startsWith('FR-')) return 'fruity';
    if (id.startsWith('SP-')) return 'spicy';
    
    // ID 패턴이 명확하지 않은 경우, 통상적인 향료 코드 패턴 확인
    if (id.startsWith('BK-')) return 'woody'; // 블랙은 보통 우디
    if (id.startsWith('MD-')) return 'citrus'; // 만다린은 보통 시트러스
    if (id.startsWith('RS-')) return 'floral'; // 로즈는 보통 플로럴
    if (id.startsWith('AM-')) return 'musky'; // 앰버는 보통 머스크
    if (id.startsWith('PK-')) return 'spicy'; // 핑크는 보통 스파이시 계열
    if (id.startsWith('BE-')) return 'fruity'; // 베리는 보통 프루티
    
    // 기타 ID 패턴 분석
    const idLower = id.toLowerCase();
    if (idLower.includes('wood') || idLower.includes('sand')) return 'woody';
    if (idLower.includes('rose') || idLower.includes('jas')) return 'floral';
    if (idLower.includes('orange') || idLower.includes('lemon')) return 'citrus';
    if (idLower.includes('musk') || idLower.includes('amber')) return 'musky';
    if (idLower.includes('peach') || idLower.includes('berry')) return 'fruity';
    if (idLower.includes('pepper') || idLower.includes('spice')) return 'spicy';
    
    return 'unknown';
  };
  
  // 향료가 전체 향수에 미치는 영향 설명
  const getScentEffectOnPerfume = (category: string, ratio: number, isMainScent: boolean): string => {
    if (isMainScent) {
      return `이 향료는 전체 향수의 중심이 되어 ${getCategoryCharacteristics(category).personality}을 제공합니다. ${ratio}%의 높은 비율로 주요 인상을 형성합니다.`;
    }
    
    if (ratio > 30) {
      return `상당한 비중(${ratio}%)을 차지하여 향수의 주요 특성을 결정하는 중요한 역할을 합니다. ${getCategoryCharacteristics(category).effect}.`;
    }
    
    if (ratio > 15) {
      return `중간 비중(${ratio}%)으로 향수의 특성을 보완하고 균형을 맞추는 역할을 합니다. ${getCategoryCharacteristics(category).effect}.`;
    }
    
    return `낮은 비중(${ratio}%)이지만, 전체 향수에 미묘한 깊이와 복잡성을 더하는 중요한 역할을 합니다. 다른 향료들의 특성을 돋보이게 하면서도 은은한 ${getCategoryCharacteristics(category).description}를 제공합니다.`;
  };
  
  // 비율 결정 근거 설명
  const getRatioExplanation = (category: string, ratio: number, isUserRequested: boolean): string => {
    if (isUserRequested) {
      if (ratio > 50) {
        return `사용자 요청에 따라 매우 높은 비율(${ratio}%)로 구성하여 이 향료의 특성이 확실히 드러나도록 했습니다.`;
      } else if (ratio > 30) {
        return `사용자 요청을 반영하면서도 다른 향료와의 조화를 고려하여 ${ratio}%의 비율로 조정했습니다.`;
      } else {
        return `사용자 요청 향료지만, 전체 향수의 균형을 위해 ${ratio}%의 비율로 미묘하게 첨가했습니다.`;
      }
    }
    
    const characteristics = getCategoryCharacteristics(category);
    
    if (ratio > 50) {
      return `${ratio}%의 높은 비율은 ${characteristics.description}가 향수의 핵심 특성이 되도록 설계되었습니다.`;
    } else if (ratio > 30) {
      return `${ratio}%의 비율은 다른 향료들과 균형을 이루면서도 ${characteristics.personality}이 충분히 느껴지도록 조정되었습니다.`;
    } else if (ratio > 15) {
      return `${ratio}%의 비율로 다른 주요 향료를 보완하면서 ${characteristics.description}를 은은하게 더합니다.`;
    } else {
      return `${ratio}%의 소량으로 향수에 미묘한 깊이와 차원을 더하여 더욱 복잡하고 매력적인 향을 완성합니다.`;
    }
  };
  
  // 해당 향료가 추천된 이유 생성 (세부적이고 정교한 버전)
  const generateReason = (): string => {
    const category = getScentCategory(scent.id);
    const characteristics = getCategoryCharacteristics(category);
    const isMainScent = scent.ratio > 40;
    const isUserRequested = feedback.specificScents?.some(s => formatScentCode(s.name) === scent.id) || false;
    
    // 1. 기존 향수인 경우 (perfumeId와 일치)
    if (scent.id === feedback.perfumeId) {
      const retentionRatio = feedback.retentionPercentage || 50;
      let explanation = `기존 향수(${scent.name})의 독특한 특성을 ${retentionRatio}% 유지하도록 설계했습니다. `;
      
      if (retentionRatio > 70) {
        explanation += `높은 유지율(${retentionRatio}%)로 원래 향수의 정체성을 크게 보존하면서도 미세한 조정을 통해 개선했습니다.`;
      } else if (retentionRatio > 40) {
        explanation += `균형 잡힌 유지율(${retentionRatio}%)로 원래 향수의 특성을 기반으로 하되, 피드백에 따른 변화를 적절히 반영했습니다.`;
      } else {
        explanation += `낮은 유지율(${retentionRatio}%)로 원래 향수에서 영감을 얻되, 상당한 변화를 주어 새로운 향 경험을 제공합니다.`;
      }
      
      explanation += `\n\n이 기본 향은 ${characteristics.description}로, 전체 향수의 근간을 형성합니다. ${scent.ratio}%의 비율은 다른 선택된 향료들과 최적의 조화를 이루도록 계산되었습니다.`;
      
      return explanation;
    }
    
    // 2. 사용자가 직접 요청한 향료인 경우
    if (isUserRequested) {
      const requestedScent = feedback.specificScents?.find(s => formatScentCode(s.name) === scent.id);
      let explanation = `피드백에서 직접 요청하신 ${scent.name} 향료입니다. `;
      
      explanation += `이 향료는 ${characteristics.description}. `;
      explanation += getRatioExplanation(category, scent.ratio, true);
      
      explanation += `\n\n${getScentEffectOnPerfume(category, scent.ratio, isMainScent)} `;
      
      if (requestedScent?.ratio && requestedScent.ratio !== scent.ratio) {
        explanation += `\n\n참고로, 원래 요청하신 비율은 ${requestedScent.ratio}%였으나, 다른 향료와의 최적 조화를 위해 ${scent.ratio}%로 조정되었습니다.`;
      }
      
      return explanation;
    }
    
    // 3. 카테고리 선호도에 따른 향료인 경우
    const hasMatchingCategoryPreference = feedback.categoryPreferences && 
      Object.entries(feedback.categoryPreferences).some(
        ([cat, pref]) => cat === category && pref === 'increase'
      );
    
    if (hasMatchingCategoryPreference) {
      let explanation = `${category} 카테고리를 강화하기 위해 신중하게 선택된 향료입니다. `;
      explanation += `이 향은 ${characteristics.description}. `;
      
      // 다른 향료와의 조화 설명
      const complementaryCategories = characteristics.bestWith;
      const otherScentsCategories = new Set<string>();
      
      // 다른 향료들의 카테고리 수집
      feedback.specificScents?.forEach(s => {
        if (formatScentCode(s.name) !== scent.id) {
          otherScentsCategories.add(getScentCategory(formatScentCode(s.name)));
        }
      });
      
      // 조화를 이루는 카테고리가 있는지 확인
      const hasComplementary = Array.from(otherScentsCategories).some(c => 
        complementaryCategories.includes(c)
      );
      
      if (hasComplementary) {
        explanation += `특히 이 향은 함께 선택된 다른 카테고리의 향료들과 훌륭한 조화를 이룹니다. `;
      }
      
      explanation += getRatioExplanation(category, scent.ratio, false);
      explanation += `\n\n${getScentEffectOnPerfume(category, scent.ratio, isMainScent)}`;
      
      return explanation;
    }
    
    // 4. 기타 AI 추천 향료인 경우
    let explanation = `전체 향수 구성의 최적 밸런스를 위해 AI가 신중하게 선택한 향료입니다. `;
    explanation += `${characteristics.description}. `;
    
    // 향 특성 피드백에 따른 설명 추가
    if (feedback.userCharacteristics) {
      if (category === 'citrus' && 
          (feedback.userCharacteristics.freshness === 'high' || 
           feedback.userCharacteristics.freshness === 'veryHigh')) {
        explanation += `사용자가 요청한 높은 청량감을 구현하기 위해 시트러스 계열 향료를 추가했습니다. `;
      }
      
      if (category === 'woody' && 
          (feedback.userCharacteristics.weight === 'high' || 
           feedback.userCharacteristics.weight === 'veryHigh')) {
        explanation += `사용자가 원하는 무게감 있는 특성을 강화하기 위해 우디 계열 향료를 선택했습니다. `;
      }
      
      if (category === 'musky' && 
          (feedback.userCharacteristics.sweetness === 'high' || 
           feedback.userCharacteristics.sweetness === 'veryHigh')) {
        explanation += `사용자가 요청한 달콤한 특성을 위해 머스크 계열의 향료를 추가했습니다. `;
      }
      
      if (category === 'spicy' && 
          (feedback.userCharacteristics.uniqueness === 'high' || 
           feedback.userCharacteristics.uniqueness === 'veryHigh')) {
        explanation += `사용자가 원하는 독특한 개성을 위해 스파이시 계열의 향료를 선택했습니다. `;
      }
    }
    
    explanation += getRatioExplanation(category, scent.ratio, false);
    explanation += `\n\n${getScentEffectOnPerfume(category, scent.ratio, isMainScent)}`;
    
    return explanation;
  };
  
  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-md text-sm text-amber-800 transition-colors"
      >
        <span>향료 설명 {isOpen ? '접기' : '펼치기'}</span>
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
          {generateReason().split('\n\n').map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-2" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// 테스팅 레시피 시각화 컴포넌트
const TestingRecipeSection = ({ 
  recipe, 
  feedback 
}: { 
  recipe: CustomPerfumeRecipe;
  feedback: PerfumeFeedback;
}) => {
  // 원본 데이터를 안전한 ScentMixture 타입으로 변환
  const processScentMixtures = (): ScentMixture[] => {
    if (!recipe.testGuide?.scentMixtures) return [];
    
    // any 타입으로 단언하여 타입 에러 해결
    return (recipe.testGuide.scentMixtures as any[]).map(scent => {
      // 타입 안전한 변환
      const scentName = scent.name;
      
      // ID 변환 로직 강화 - 이름으로 ID를 찾지 못하면 패턴 기반 ID 생성
      let scentId = scent.id || formatScentCode(scentName);
      
      // 베티버와 같은 특수 케이스 처리 - ID 형식 확인
      if (!scentId.match(/^[A-Z]{2}-\d+$/)) {
        // ID 형식이 아니면, 이름에 따라 특정 ID 패턴 할당
        if (scentName.includes('베티버')) {
          scentId = 'WD-220128'; // 베티버를 우디 계열로 할당
        } else if (scentName.includes('만다린')) {
          scentId = 'CI-860234'; // 만다린을 시트러스 계열로 할당
        } else if (scentName.includes('블랙베리')) {
          scentId = 'FR-220128'; // 블랙베리를 프루티 계열로 할당
        } else {
          // 그 외 미확인 향료는 이름 첫글자를 기준으로 ID 생성
          const prefix = getScentCategoryPrefix(scentName);
          // 간단한 해시 값으로 숫자 ID 생성
          const numId = Math.abs(
            scentName.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0)
          ) % 1000000;
          scentId = `${prefix}-${numId}`;
        }
      }
      
      const count = scent.count || Math.max(1, Math.min(10, Math.round(scent.ratio / 10)));
      
      return {
        id: scentId,
        name: scentName,
        count: count,
        ratio: scent.ratio
      };
    }).slice(0, 3); // 최대 3개 향료만 사용
  };
  
  // 향료 이름에 따른 카테고리 접두사 결정
  const getScentCategoryPrefix = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (/레몬|오렌지|베르가못|라임|자몽|시트러스/.test(lowerName)) return 'CI';
    if (/장미|로즈|자스민|라벤더|튤립|꽃|플로럴/.test(lowerName)) return 'FL';
    if (/우디|샌달우드|시더|나무|흙|이끼|파인|베티버/.test(lowerName)) return 'WD';
    if (/머스크|앰버|바닐라|통카|따뜻/.test(lowerName)) return 'MU';
    if (/복숭아|딸기|베리|과일|망고|프루티/.test(lowerName)) return 'FR';
    if (/페퍼|시나몬|진저|카다멈|스파이시|후추/.test(lowerName)) return 'SP';
    return 'UN'; // 미확인 카테고리
  };
  
  // 향료 ID에서 주요 카테고리 결정
  const getScentMainCategory = (id: string): string => {
    // ID 접두사 기반 카테고리 결정
    if (id.startsWith('CI-')) return '시트러스';
    if (id.startsWith('FL-')) return '플로럴';
    if (id.startsWith('WD-')) return '우디';
    if (id.startsWith('MU-')) return '머스크';
    if (id.startsWith('FR-')) return '프루티';
    if (id.startsWith('SP-')) return '스파이시';
    
    // 일반적인 향료 코드 패턴 확인
    if (id.startsWith('BK-')) return '우디'; // 블랙은 보통 우디
    if (id.startsWith('MD-')) return '시트러스'; // 만다린은 보통 시트러스
    if (id.startsWith('RS-')) return '플로럴'; // 로즈는 보통 플로럴
    if (id.startsWith('AM-')) return '머스크'; // 앰버는 보통 머스크
    if (id.startsWith('PK-')) return '스파이시'; // 핑크는 보통 스파이시 계열
    if (id.startsWith('BE-')) return '프루티'; // 베리는 보통 프루티
    
    return '기타';
  };
  
  // 처리된 향료 목록
  const scentMixtures = processScentMixtures();
  
  // 향료 알갱이 시각화
  const renderGranules = (scent: ScentMixture) => {
    const granules = [];
    
    for (let i = 0; i < scent.count; i++) {
      granules.push(
        <GranuleIcon 
          key={`${scent.id}-${i}`} 
          index={i}
          scentName={scent.name}
        />
      );
    }
    return granules;
  };

  // 테스트 지침을 단계별로 분리하는 함수
  const parseTestInstructions = () => {
    if (!recipe.testGuide?.instructions) return [];
    
    // 기본 지침 텍스트
    const instructions = recipe.testGuide.instructions;
    
    // 단계별로 지침 분리 (일반적으로 3단계: 준비, 혼합, 테스트)
    return [
      {
        title: '향료 알갱이 준비',
        icon: '🧪',
        content: '아래 목록의 향료 알갱이를 준비하세요.',
        extraInfo: '각 향료 코드와 개수를 정확히 확인하세요.'
      },
      {
        title: '향료 혼합하기',
        icon: '🔄',
        content: '준비한 모든 알갱이를 작은 용기에 함께 넣고 부드럽게 섞어주세요.',
        extraInfo: '알갱이가 서로 골고루 섞이도록 최소 10초 이상 혼합하세요.'
      },
      {
        title: '시향 테스트',
        icon: '👃',
        content: '혼합된 알갱이에서 나는 향을 맡고 전체적인 느낌을 평가하세요.',
        extraInfo: '이 테스트는 실제 향수 제작 전 향 조합을 확인하는 목적입니다.'
      }
    ];
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-md mb-6">
      <h4 className="font-semibold text-amber-800 mb-4 flex items-center">
        <span className="text-lg mr-2">🧪</span> 향 테스팅 레시피
      </h4>
      
      {/* 테스트 목적 설명 */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-l-4 border-amber-400">
        <div className="flex items-start">
          <div className="bg-amber-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h5 className="font-medium text-amber-800 mb-1">테스팅 목적</h5>
            <p className="text-sm text-gray-600">
              이 테스팅 레시피는 실제 향수 제작 전에 향료 조합을 미리 확인하기 위한 것입니다. 
              알갱이 개수는 비율에 따라 계산되었으며, 혼합 후의 향이 최종 향수의 느낌과 유사합니다.
            </p>
          </div>
        </div>
      </div>
      
      {/* 향료 조합 - 간결한 정보 테이블 형식 */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
          <span className="text-amber-500 mr-2">📋</span> 필요한 향료 알갱이
        </h5>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50">
              <tr>
                <th className="py-2 px-3 text-left font-medium text-amber-800 rounded-tl-lg">향료 코드</th>
                <th className="py-2 px-3 text-left font-medium text-amber-800">향료 계열</th>
                <th className="py-2 px-3 text-center font-medium text-amber-800">비율</th>
                <th className="py-2 px-3 text-center font-medium text-amber-800 rounded-tr-lg">알갱이 개수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {scentMixtures.map((scent, idx) => (
                <tr key={scent.id} className={idx % 2 === 0 ? "bg-amber-50/30" : "bg-white"}>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 py-1 px-2 rounded">
                      {scent.id}
                    </span>
                  </td>
                  <td className="py-3 px-3">{getScentMainCategory(scent.id)}</td>
                  <td className="py-3 px-3 text-center">{scent.ratio}%</td>
                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center">
                      <span className="bg-amber-200 text-amber-800 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        {scent.count}
                      </span>
                      <span className="text-gray-500 text-xs">알갱이</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 단계별 테스트 방법 */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <h5 className="font-medium text-gray-700 mb-3 flex items-center">
          <span className="text-amber-500 mr-2">📝</span> 테스트 단계
        </h5>
        
        <div className="space-y-4">
          {parseTestInstructions().map((step, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 border-l-4 ${
                index === 0 ? 'bg-blue-50 border-blue-400' : 
                index === 1 ? 'bg-green-50 border-green-400' : 
                'bg-purple-50 border-purple-400'
              }`}
            >
              <div className="flex items-start">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
                  index === 0 ? 'bg-blue-100 text-blue-700' : 
                  index === 1 ? 'bg-green-100 text-green-700' : 
                  'bg-purple-100 text-purple-700'
                }`}>
                  <span>{step.icon}</span>
                </div>
                <div className="flex-1">
                  <h6 className={`font-medium ${
                    index === 0 ? 'text-blue-800' : 
                    index === 1 ? 'text-green-800' : 
                    'text-purple-800'
                  }`}>
                    Step {index + 1}: {step.title}
                  </h6>
                  <p className="text-gray-700 mt-1">{step.content}</p>
                  
                  {index === 0 && scentMixtures.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scentMixtures.map((scent) => (
                        <div key={scent.id} className="bg-white rounded-lg px-3 py-2 border border-blue-200 flex items-center shadow-sm">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 py-0.5 px-1.5 rounded mr-2">
                            {scent.id}
                          </span>
                          <div className="flex items-center">
                            <span className="mr-1 text-sm">알갱이</span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {scent.count}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">개</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div className="mt-3 bg-white rounded-lg p-3 border border-green-200 flex items-center">
                      <div className="mr-2 text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">
                        모든 알갱이를 용기에 넣고 <span className="font-medium">10초 이상</span> 부드럽게 흔들어 섞어주세요.
                      </span>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-2 ${
                    index === 0 ? 'text-blue-600' : 
                    index === 1 ? 'text-green-600' : 
                    'text-purple-600'
                  }`}>
                    {step.extraInfo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 주의사항 */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-start">
          <div className="text-amber-600 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium">테스팅 주의사항</p>
            <p className="text-xs text-amber-700 mt-1">
              이 테스팅 레시피는 향수 제작 전 시향(향 테스트)을 위한 것입니다.
              알갱이 개수는 비율에 따라 계산되며, 실제 향수 제작 시에는 정확한 조향 레시피가 필요합니다.
              각 향료의 코드를 정확히 확인하고 혼합해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 카테고리 변화를 시각화하는 컴포넌트
const CategoryChangeRadar = ({ feedback, recipe }: { feedback: PerfumeFeedback, recipe: CustomPerfumeRecipe }) => {
  // 카테고리 정의
  const categories = ['citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy'];
  
  // 카테고리별 한글 이름
  const categoryNames: Record<string, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 기존 향수의 카테고리 점수 (예시)
  const originalScores = Array(categories.length).fill(5);
  
  // 피드백 카테고리 선호도에 따라 점수 조정
  const adjustedScores = [...originalScores];
  
  if (feedback.categoryPreferences) {
    categories.forEach((cat, index) => {
      const preference = feedback.categoryPreferences ? 
        (feedback.categoryPreferences as Record<string, CategoryPreference>)[cat] : 
        undefined;
        
      if (preference === 'increase') {
        adjustedScores[index] += 2;
      } else if (preference === 'decrease') {
        adjustedScores[index] -= 2;
      }
    });
  }
  
  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <p className="text-sm font-medium text-gray-700 mb-2">향 카테고리 변화</p>
      
      <div className="aspect-square w-full max-w-md mx-auto">
        <Radar 
          data={{
            labels: categories.map(cat => categoryNames[cat] || cat),
            datasets: [
              {
                label: '변경 전',
                data: originalScores,
                backgroundColor: 'rgba(99, 112, 241, 0.2)',
                borderColor: 'rgba(99, 112, 241, 1)',
                borderWidth: 1,
              },
              {
                label: '변경 후',
                data: adjustedScores,
                backgroundColor: 'rgba(239, 134, 51, 0.2)',
                borderColor: 'rgba(239, 134, 51, 1)',
                borderWidth: 1,
              }
            ]
          }}
          options={{
            scales: {
              r: {
                min: 0,
                max: 10,
                ticks: {
                  stepSize: 2,
                  display: false
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export const SuccessView: React.FC<SuccessViewProps> = ({ 
  feedback, 
  recipe, 
  customizationLoading, 
  onClose 
}) => {
  return (
    <div className="py-4 flex flex-col">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      
      <h3 className="text-center text-xl font-bold text-gray-800 mb-4">
        맞춤 향수 레시피가 준비되었습니다!
      </h3>
      
      {customizationLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 border-4 border-t-transparent border-orange-500 rounded-full animate-spin mb-6"></div>
          <p className="text-orange-600 font-bold">맞춤 향수 레시피 생성 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요. 최대 15초 정도 소요됩니다.</p>
        </div>
      ) : recipe ? (
        <div className="mt-6 space-y-8">
          {/* 피드백 반영 시각화 - Before & After */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md">
            <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
              <span className="text-lg mr-2">✨</span> 피드백이 반영된 결과
            </h4>
            
            {/* 유지 비율 시각화 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">기존 향 유지 비율</p>
                <p className="text-sm font-medium text-blue-600">{feedback.retentionPercentage}%</p>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                  style={{ width: `${feedback.retentionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* 향 카테고리 Before & After */}
            <CategoryChangeRadar feedback={feedback} recipe={recipe} />
            
            {/* 카테고리 선호도 목록 */}
            {feedback.categoryPreferences && (
              <div className="grid grid-cols-2 gap-3 mb-2">
                {Object.entries(feedback.categoryPreferences).map(([category, preference]) => (
                  preference !== 'maintain' && (
                    <div key={category} className="bg-white rounded-lg p-3 border border-blue-100 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-2">
                        {category === 'citrus' && '🍊'}
                        {category === 'floral' && '🌸'}
                        {category === 'woody' && '🌲'}
                        {category === 'musky' && '🧴'}
                        {category === 'fruity' && '🍎'}
                        {category === 'spicy' && '🌶️'}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{category}</p>
                        <p className="text-sm font-medium text-blue-600">
                          {preference === 'increase' ? '강화' : preference === 'decrease' ? '약화' : '유지'}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
          
          {/* 테스팅 레시피 시각화 */}
          <TestingRecipeSection recipe={recipe} feedback={feedback} />
          
          {/* 레시피 시각화 - 도넛 차트 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200 shadow-md">
            <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
              <span className="text-lg mr-2">📊</span> 레시피 구성 비율
            </h4>
            
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2 aspect-square max-w-[200px] mx-auto">
                <Doughnut 
                  data={{
                    // 최대 3개의 향료만 표시
                    labels: recipe.recipe10ml?.slice(0, 3).map(c => formatScentCode(c.name)) || [],
                    datasets: [{
                      data: recipe.recipe10ml?.slice(0, 3).map(c => c.percentage) || [],
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                      ],
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-1/2">
                <div className="grid grid-cols-1 gap-2">
                  {recipe.recipe10ml?.slice(0, 3).map((component, i) => {
                    const scentId = formatScentCode(component.name || '');
                    const scentName = component.name || '';
                    
                    return (
                      <div key={i} className="flex items-center p-2 bg-white rounded-lg border border-orange-100">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                          ][i % 3]
                        }}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <span className="text-xs font-bold text-gray-800 mr-1">{scentId}</span>
                              <span className="text-xs text-gray-500">{scentName}</span>
                            </div>
                            <span className="text-xs font-medium text-orange-600">{component.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
            >
              확인 완료
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-700">
            피드백이 성공적으로 제출되었습니다!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            소중한 의견 감사합니다. 향수 추천 품질 향상에 큰 도움이 됩니다.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};