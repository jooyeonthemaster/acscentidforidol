import { NextRequest, NextResponse } from 'next/server';
import { PerfumeFeedback, CustomPerfumeRecipe, PerfumeCategory, CategoryPreference, PerfumePersona } from '@/app/types/perfume';
import perfumePersonas from '@/app/data/perfumePersonas';
import { generateCustomPerfumePrompt, parseCustomPerfumeRecipe } from '@/app/utils/promptTemplates/feedbackPrompts';

/**
 * 피드백 데이터를 기반으로 맞춤형 향수 레시피 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const data = await request.json();
    const feedback: PerfumeFeedback = data.feedback;
    
    if (!feedback || !feedback.perfumeId) {
      return NextResponse.json(
        { error: '유효하지 않은 피드백 데이터입니다.' },
        { status: 400 }
      );
    }
    
    // 해당 향수 정보 가져오기
    const perfume = perfumePersonas.personas.find(
      (p: PerfumePersona) => p.id === feedback.perfumeId
    );
    
    if (!perfume) {
      return NextResponse.json(
        { error: '해당 향수를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 피드백 데이터에 향수 이름 추가 (없는 경우)
    if (!feedback.perfumeName) {
      feedback.perfumeName = perfume.name;
    }
    
    // 맞춤형 향수 레시피 생성
    const recipe = await generateCustomRecipe(feedback, perfume);
    
    return NextResponse.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error('맞춤형 향수 레시피 생성 오류:', error);
    return NextResponse.json(
      { error: '맞춤형 향수 레시피를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 맞춤형 향수 레시피 생성 함수
 */
async function generateCustomRecipe(feedback: PerfumeFeedback, perfume: PerfumePersona): Promise<CustomPerfumeRecipe> {
  try {
    // 기본 향료 구성
    const baseScents = getBaseScentComponents(perfume, feedback);
    
    // 피드백에 따른 특성 조정
    const characteristicScents = getCharacteristicScentComponents(feedback);
    
    // 요청한 특정 향료 조정
    const specificScents = getSpecificScentComponents(feedback);
    
    // 모든 향료 구성요소 통합
    const allScents = [
      ...baseScents,
      ...characteristicScents,
      ...specificScents
    ];
    
    // 비율 정규화 및 10ml/50ml 레시피 생성
    const normalizedScents = normalizeScents(allScents);
    const recipe10ml = calculateRecipe(normalizedScents, 1.0); // 10ml에는 1g의 향료 사용
    const recipe50ml = calculateRecipe(normalizedScents, 5.0); // 50ml에는 5g의 향료 사용
    
    // 시향 테스트 가이드 생성
    const testGuide = generateTestGuide(normalizedScents, feedback, perfume);
    
    // 레시피 설명 생성
    const explanation = generateExplanation(feedback, normalizedScents, perfume);
    
    // 최종 레시피 반환
    return {
      basedOn: perfume.name,
      recipe10ml,
      recipe50ml,
      description: `${perfume.name} 향수를 기반으로 맞춤 제작된, ${getRecipeCharacteristic(feedback)} 향수입니다.`,
      testGuide,
      explanation
    };
  } catch (error) {
    console.error('레시피 생성 오류:', error);
    
    // 기본 레시피 반환
    return {
      basedOn: perfume.name,
      recipe10ml: [
        { name: perfume.name, amount: '1.00g', percentage: 100 }
      ],
      recipe50ml: [
        { name: perfume.name, amount: '5.00g', percentage: 100 }
      ],
      description: `${perfume.name} 향수의 기본 레시피입니다.`,
      testGuide: {
        instructions: '기본 향수를 그대로 시향해보세요.',
        scentMixtures: [
          { name: perfume.name, ratio: 100 }
        ]
      },
      explanation: {
        rationale: '오류로 인해 기본 레시피가 제공됩니다.',
        expectedResult: '기존 향수의 향을 유지합니다.',
        recommendation: '모든 상황에 무난하게 어울립니다.'
      }
    };
  }
}

/**
 * 기본 향료 구성요소 생성
 */
function getBaseScentComponents(perfume: PerfumePersona, feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  // 유지 비율 (기본값: 50%)
  const retentionRatio = (feedback.retentionPercentage ?? 50) / 100;
  
  // 가장 높은 카테고리 점수 3개 선택
  const categoryScores = Object.entries(perfume.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // 각 카테고리에 해당하는 향료 선택
  return categoryScores.map(([category, score]) => {
    // 카테고리별 대표 향료 선택
    const scentName = getCategoryScentName(category as PerfumeCategory, perfume.id);
    
    // 기본 비율 계산 (카테고리 점수에 따라 차등)
    const baseRatio = (score / 10) * 70 * retentionRatio; // 최대 70%까지 할당하고 유지 비율 적용
    
    return {
      name: scentName,
      ratio: baseRatio,
      category: category as PerfumeCategory
    };
  });
}

/**
 * 카테고리별 대표 향료 이름 가져오기
 */
function getCategoryScentName(category: PerfumeCategory, perfumeId: string): string {
  // 카테고리별 대표 향료 매핑
  const categoryScents: Record<PerfumeCategory, string[]> = {
    citrus: ['베르가못', '레몬', '라임', '오렌지'],
    floral: ['로즈', '자스민', '튤립', '라벤더'],
    woody: ['샌달우드', '시더우드', '베티버', '파인'],
    musky: ['머스크', '앰버', '바닐라', '통카빈'],
    fruity: ['복숭아', '딸기', '블랙베리', '레드베리'],
    spicy: ['핑크페퍼', '블랙페퍼', '진저', '시나몬']
  };
  
  // 향수 ID를 기반으로 일관된 선택
  const scentIndex = Math.abs(
    perfumeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % categoryScents[category].length;
  
  return categoryScents[category][scentIndex];
}

/**
 * 피드백에 따른 특성 조정 향료 생성
 */
function getCharacteristicScentComponents(feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  const components: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }> = [];
  
  // 카테고리 선호도 처리
  if (feedback.categoryPreferences) {
    Object.entries(feedback.categoryPreferences).forEach(([category, preference]) => {
      if (preference === 'increase') {
        // 해당 카테고리 향 증가
        components.push({
          name: getCategoryAdjustmentScent(category as PerfumeCategory, true),
          ratio: 15, // 15% 할당
          category: category as PerfumeCategory
        });
      } else if (preference === 'decrease') {
        // 반대 카테고리 향 증가하여 상대적으로 감소 효과
        const oppositeCategory = getOppositeCategory(category as PerfumeCategory);
        components.push({
          name: getCategoryAdjustmentScent(oppositeCategory, false),
          ratio: 10, // 10% 할당
          category: oppositeCategory
        });
      }
      // maintain은 변화 없음
    });
  }
  
  // 향 특성 조정
  if (feedback.userCharacteristics) {
    Object.entries(feedback.userCharacteristics).forEach(([characteristic, value]) => {
      if (value !== 'medium') {
        const { name, ratio, category } = getCharacteristicAdjustment(
          characteristic as any, 
          value as any
        );
        components.push({ name, ratio, category });
      }
    });
  }
  
  return components;
}

/**
 * 카테고리 조정을 위한 향료 선택
 */
function getCategoryAdjustmentScent(category: PerfumeCategory, isIncrease: boolean): string {
  // 카테고리별 향료 매핑
  const categoryAdjustmentScents: Record<PerfumeCategory, [string, string]> = {
    citrus: ['베르가못', '레몬'],
    floral: ['로즈', '자스민'],
    woody: ['샌달우드', '시더우드'],
    musky: ['머스크', '앰버'],
    fruity: ['복숭아', '블랙베리'],
    spicy: ['핑크페퍼', '진저']
  };
  
  // 증가/감소에 따라 다른 향료 선택
  return categoryAdjustmentScents[category][isIncrease ? 0 : 1];
}

/**
 * 상반되는 카테고리 가져오기
 */
function getOppositeCategory(category: PerfumeCategory): PerfumeCategory {
  const opposites: Record<PerfumeCategory, PerfumeCategory> = {
    citrus: 'woody',
    floral: 'spicy',
    woody: 'citrus',
    musky: 'fruity',
    fruity: 'musky',
    spicy: 'floral'
  };
  return opposites[category] || 'woody';
}

/**
 * 향 특성 조정을 위한 향료 및 비율 가져오기
 */
function getCharacteristicAdjustment(
  characteristic: 'weight' | 'sweetness' | 'freshness' | 'uniqueness',
  value: 'veryLow' | 'low' | 'high' | 'veryHigh'
): { name: string; ratio: number; category: PerfumeCategory } {
  // 특성에 따른 향료 및 카테고리 매핑
  const characteristicMap = {
    weight: {
      low: { name: '시트러스 블렌드', category: 'citrus' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '베르가못', category: 'citrus' as PerfumeCategory, ratio: 15 },
      high: { name: '샌달우드', category: 'woody' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '앰버 블렌드', category: 'musky' as PerfumeCategory, ratio: 15 }
    },
    sweetness: {
      low: { name: '우디 블렌드', category: 'woody' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '시더우드', category: 'woody' as PerfumeCategory, ratio: 15 },
      high: { name: '바닐라', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '허니 블렌드', category: 'fruity' as PerfumeCategory, ratio: 15 }
    },
    freshness: {
      low: { name: '앰버 블렌드', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '스파이스 블렌드', category: 'spicy' as PerfumeCategory, ratio: 15 },
      high: { name: '시트러스 블렌드', category: 'citrus' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '민트 블렌드', category: 'citrus' as PerfumeCategory, ratio: 15 }
    },
    uniqueness: {
      low: { name: '머스크 블렌드', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '앰버', category: 'musky' as PerfumeCategory, ratio: 15 },
      high: { name: '이국적 블렌드', category: 'spicy' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '스모키 블렌드', category: 'woody' as PerfumeCategory, ratio: 15 }
    }
  };
  
  return characteristicMap[characteristic][value];
}

/**
 * 사용자가 요청한 특정 향료 처리
 */
function getSpecificScentComponents(feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  const components: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }> = [];
  
  if (feedback.specificScents && feedback.specificScents.length > 0) {
    feedback.specificScents.forEach(scent => {
      if (scent.action === 'add' && scent.ratio) {
        // 카테고리 추정
        const category = estimateScentCategory(scent.name);
        
        // 비율 적용 (최대 30%까지 반영)
        const ratio = Math.min((scent.ratio / 100) * 30, 30);
        
        components.push({
          name: scent.name,
          ratio,
          category
        });
      }
    });
  }
  
  return components;
}

/**
 * 향료 이름으로 카테고리 추정
 */
function estimateScentCategory(name: string): PerfumeCategory {
  const lowerName = name.toLowerCase();
  
  if (/레몬|오렌지|베르가못|라임|자몽|시트러스/.test(lowerName)) {
    return 'citrus';
  }
  if (/장미|로즈|자스민|라벤더|튤립|꽃|플로럴/.test(lowerName)) {
    return 'floral';
  }
  if (/우디|샌달우드|시더|나무|흙|이끼|파인/.test(lowerName)) {
    return 'woody';
  }
  if (/머스크|앰버|바닐라|통카|머스크|따뜻/.test(lowerName)) {
    return 'musky';
  }
  if (/복숭아|딸기|베리|과일|망고|프루티/.test(lowerName)) {
    return 'fruity';
  }
  if (/페퍼|시나몬|진저|카다멈|스파이시|후추/.test(lowerName)) {
    return 'spicy';
  }
  
  // 기본값
  return 'woody';
}

/**
 * 향료 비율 정규화 (모든 비율의 합을 100%로 만들기)
 */
function normalizeScents(scents: Array<{ name: string; ratio: number; category: PerfumeCategory }>): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  // 총 비율 계산
  const totalRatio = scents.reduce((sum, scent) => sum + scent.ratio, 0);
  
  // 0이면 기본값 반환
  if (totalRatio === 0) {
    return [{ name: '기본 블렌드', ratio: 100, category: 'woody' }];
  }
  
  // 비율 정규화
  return scents.map(scent => ({
    ...scent,
    ratio: (scent.ratio / totalRatio) * 100
  }));
}

/**
 * 레시피 계산 (향료 g 단위로 변환)
 */
function calculateRecipe(scents: Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}>, totalGrams: number): Array<{
  name: string;
  amount: string;
  percentage: number;
}> {
  return scents.map(scent => ({
    name: scent.name,
    amount: `${((scent.ratio / 100) * totalGrams).toFixed(2)}g`,
    percentage: Math.round(scent.ratio)
  }));
}

/**
 * 시향 테스트 가이드 생성
 */
function generateTestGuide(scents: Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}>, feedback?: PerfumeFeedback, perfume?: PerfumePersona): {
  instructions: string;
  scentMixtures: Array<{ id: string; name: string; count: number; ratio: number }>;
} {
  // 향료 이름을 ID로 변환하는 유틸리티 함수 임포트
  const { formatScentCode, findScentIdByName, findScentNameById } = require('@/app/components/feedback/utils/formatters');
  
  // 선택된 향료 목록 준비
  let selectedScents = [...scents];
  
  // 1. 기본 향수를 첫 번째 항목으로 포함 (perfume이 제공된 경우)
  if (perfume) {
    // 기존 selectedScents에서 기본 향수가 있는지 확인
    const baseExists = selectedScents.find(s => s.name === perfume.name);
    
    // 없으면 기본 향수 추가 (유지 비율에 따라)
    if (!baseExists) {
      const retentionRatio = (feedback?.retentionPercentage ?? 50) / 100;
      selectedScents.unshift({
        name: perfume.name,
        ratio: 50 * retentionRatio, // 기본 비율의 50%를 기본 향수에 할당
        category: 'woody' as PerfumeCategory // 기본값
      });
    }
  }
  
  // 2. 사용자가 선택한 특정 향료 처리 (최대 2개)
  if (feedback?.specificScents && feedback.specificScents.length > 0) {
    feedback.specificScents.forEach(specificScent => {
      if (specificScent.action === 'add' && specificScent.name) {
        // 이미 선택된 향료 목록에 있는지 확인
        const existingIndex = selectedScents.findIndex(s => 
          s.name === specificScent.name || formatScentCode(s.name) === formatScentCode(specificScent.name)
        );
        
        if (existingIndex === -1) {
          // 없으면 새로 추가
          selectedScents.push({
            name: specificScent.name,
            ratio: specificScent.ratio || 50, // 기본값 50
            category: specificScent.category || 'woody' as PerfumeCategory
          });
        } else {
          // 있으면 비율 업데이트
          selectedScents[existingIndex].ratio = specificScent.ratio || selectedScents[existingIndex].ratio;
        }
      }
    });
  }
  
  // 3. 상위 3개 향료만 선택 (비율순)
  // 최대 향료 개수를 3개로 제한 (기본 향 + 최대 2개 추가)
  const topScents = selectedScents
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);
  
  // 4. 향료 비율 재정규화
  const totalTopRatio = topScents.reduce((sum, scent) => sum + scent.ratio, 0);
  
  // 5. 알갱이 개수 계산 및 ID 매핑
  const scentMixtures = topScents.map(scent => {
    // 향료 ID 찾기
    const id = formatScentCode(scent.name);
    const name = scent.name;
    
    // 비율 계산 (0-100%)
    const ratio = Math.round((scent.ratio / totalTopRatio) * 100);
    
    // 알갱이 개수 계산 (비율에 따라 1-10개 사이의 정수)
    // 알갱이 개수 = 비율 / 10 (반올림, 최소 1개, 최대 10개)
    const count = Math.max(1, Math.min(10, Math.round(ratio / 10)));
    
    return {
      id,
      name,
      count,
      ratio
    };
  });
  
  // 6. 테스트 방법 설명 생성
  // 알갱이 목록 텍스트 생성
  const granulesList = scentMixtures.map(scent => `${scent.id} ${scent.count}알`).join(', ');
  
  // 비율 목록 텍스트 생성
  const ratiosList = scentMixtures.map(scent => `${scent.name} (${scent.id}) ${scent.ratio}%`).join(', ');
  
  // 최종 안내 텍스트
  const instructions = `
다음과 같이 향료 알갱이를 준비하여 시향해보세요:
${granulesList}

알갱이들을 작은 용기에 함께 넣고 섞어서 완성된 향의 조합을 경험해보세요.
각 향료의 비율은 ${ratiosList} 입니다.

이 테스팅 레시피는 향수 제작 전 시향(향 테스트)을 위한 것입니다.
  `.trim();
  
  return {
    instructions,
    scentMixtures
  };
}

/**
 * 레시피 설명 생성
 */
function generateExplanation(
  feedback: PerfumeFeedback, 
  scents: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }>,
  perfume: PerfumePersona
): {
  rationale: string;
  expectedResult: string;
  recommendation: string;
} {
  // 주요 카테고리 파악
  const categoryRatios: Record<PerfumeCategory, number> = {
    citrus: 0,
    floral: 0,
    woody: 0,
    musky: 0,
    fruity: 0,
    spicy: 0
  };
  
  // 카테고리별 비율 합산
  scents.forEach(scent => {
    categoryRatios[scent.category] += scent.ratio;
  });
  
  // 상위 2개 카테고리 파악
  const topCategories = Object.entries(categoryRatios)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category as PerfumeCategory);
  
  // 카테고리 한글 이름
  const categoryDisplayNames: Record<PerfumeCategory, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 계절 추천
  const seasonRecommendation = getSeasonRecommendation(topCategories);
  
  // 설명 생성
  const rationale = `
${perfume.name} 향수를 기반으로 하여, ${feedback.retentionPercentage || 50}%의 기존 향을 유지하면서 
사용자의 피드백에 따라 ${topCategories.map(c => categoryDisplayNames[c]).join('과 ')} 노트를 
강조했습니다. ${getSpecificScentExplanation(feedback)}
  `.trim();
  
  // 예상되는 향의 특징
  const expectedResult = `
이 조합은 ${getCategoryDescription(topCategories[0])}와(과) ${getCategoryDescription(topCategories[1])}가 
조화롭게 어우러진 향을 제공합니다. ${getCharacteristicsExplanation(feedback)}
  `.trim();
  
  // 추천 사항
  const recommendation = `
이 향수는 ${seasonRecommendation}에 특히 잘 어울립니다. ${getOccasionRecommendation(topCategories)}
  `.trim();
  
  return {
    rationale,
    expectedResult,
    recommendation
  };
}

/**
 * 특정 향료 설명 생성
 */
function getSpecificScentExplanation(feedback: PerfumeFeedback): string {
  if (!feedback.specificScents || feedback.specificScents.length === 0) {
    return '';
  }
  
  const addedScents = feedback.specificScents
    .filter(s => s.action === 'add')
    .map(s => s.name);
  
  if (addedScents.length === 0) {
    return '';
  }
  
  return `특별히 요청하신 ${addedScents.join(', ')} 향료를 추가하여 개성을 더했습니다.`;
}

/**
 * 향 특성 설명 생성
 */
function getCharacteristicsExplanation(feedback: PerfumeFeedback): string {
  if (!feedback.userCharacteristics) {
    return '';
  }
  
  const characteristics = [];
  
  if (feedback.userCharacteristics.weight === 'high' || feedback.userCharacteristics.weight === 'veryHigh') {
    characteristics.push('무게감 있는');
  } else if (feedback.userCharacteristics.weight === 'low' || feedback.userCharacteristics.weight === 'veryLow') {
    characteristics.push('가벼운');
  }
  
  if (feedback.userCharacteristics.sweetness === 'high' || feedback.userCharacteristics.sweetness === 'veryHigh') {
    characteristics.push('달콤한');
  } else if (feedback.userCharacteristics.sweetness === 'low' || feedback.userCharacteristics.sweetness === 'veryLow') {
    characteristics.push('건조한');
  }
  
  if (feedback.userCharacteristics.freshness === 'high' || feedback.userCharacteristics.freshness === 'veryHigh') {
    characteristics.push('청량한');
  } else if (feedback.userCharacteristics.freshness === 'low' || feedback.userCharacteristics.freshness === 'veryLow') {
    characteristics.push('따뜻한');
  }
  
  if (feedback.userCharacteristics.uniqueness === 'high' || feedback.userCharacteristics.uniqueness === 'veryHigh') {
    characteristics.push('독특한');
  } else if (feedback.userCharacteristics.uniqueness === 'low' || feedback.userCharacteristics.uniqueness === 'veryLow') {
    characteristics.push('부드러운');
  }
  
  if (characteristics.length === 0) {
    return '';
  }
  
  return `특히 ${characteristics.join(', ')} 특성이 두드러집니다.`;
}

/**
 * 카테고리 설명 가져오기
 */
function getCategoryDescription(category: PerfumeCategory): string {
  const descriptions: Record<PerfumeCategory, string> = {
    citrus: '상쾌하고 활기찬 시트러스 향',
    floral: '우아하고 여성스러운 꽃향기',
    woody: '깊고 따뜻한 나무의 향',
    musky: '포근하고 관능적인 머스크 향',
    fruity: '달콤하고 즙이 많은 과일 향',
    spicy: '자극적이고 강렬한 스파이시 향'
  };
  
  return descriptions[category];
}

/**
 * 계절 추천 가져오기
 */
function getSeasonRecommendation(categories: PerfumeCategory[]): string {
  // 카테고리별 계절 추천
  const seasonMap: Record<PerfumeCategory, string[]> = {
    citrus: ['봄', '여름'],
    floral: ['봄', '여름'],
    woody: ['가을', '겨울'],
    musky: ['가을', '겨울'],
    fruity: ['봄', '여름'],
    spicy: ['가을', '겨울']
  };
  
  // 상위 2개 카테고리의 계절 조합
  const seasons = new Set<string>();
  categories.forEach(category => {
    seasonMap[category].forEach(season => seasons.add(season));
  });
  
  return Array.from(seasons).join('과 ');
}

/**
 * 상황 추천 가져오기
 */
function getOccasionRecommendation(categories: PerfumeCategory[]): string {
  const occasions: Record<PerfumeCategory, string[]> = {
    citrus: ['일상적인 활동', '스포츠 활동', '야외 행사'],
    floral: ['데이트', '결혼식', '사교 모임'],
    woody: ['사무실', '비즈니스 미팅', '정장을 입는 자리'],
    musky: ['저녁 약속', '특별한 밤', '로맨틱한 자리'],
    fruity: ['캐주얼한 모임', '쇼핑', '친구와의 만남'],
    spicy: ['중요한 프레젠테이션', '격식 있는 자리', '파티']
  };
  
  // 주요 카테고리에 따른 추천
  const mainCategory = categories[0];
  const occasionList = occasions[mainCategory];
  
  return `${occasionList[0]}이나 ${occasionList[1]}에 사용하기 좋으며, 특히 ${occasionList[2]}에 사용하면 좋은 인상을 줄 수 있습니다.`;
}

/**
 * 레시피 특성 가져오기
 */
function getRecipeCharacteristic(feedback: PerfumeFeedback): string {
  if (!feedback.userCharacteristics) {
    return '균형 잡힌';
  }
  
  // 두드러진 특성 찾기
  const extremeCharacteristics = Object.entries(feedback.userCharacteristics)
    .filter(([, value]) => value === 'veryHigh' || value === 'veryLow')
    .map(([char]) => char);
  
  if (extremeCharacteristics.length === 0) {
    return '균형 잡힌';
  }
  
  // 특성에 따른 설명
  const characteristicDescriptions: Record<string, string> = {
    weight: feedback.userCharacteristics.weight === 'veryHigh' ? '무게감 있는' : '가벼운',
    sweetness: feedback.userCharacteristics.sweetness === 'veryHigh' ? '달콤한' : '건조한',
    freshness: feedback.userCharacteristics.freshness === 'veryHigh' ? '청량한' : '따뜻한',
    uniqueness: feedback.userCharacteristics.uniqueness === 'veryHigh' ? '독특한' : '편안한'
  };
  
  // 첫 번째 극단적 특성 사용
  return characteristicDescriptions[extremeCharacteristics[0]];
} 