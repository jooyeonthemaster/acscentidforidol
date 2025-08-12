import { PerfumeCategory, PerfumeCharacteristics, Perfume } from '../types/perfume';
import { PerfumePersona, TraitScores, ScentCategoryScores, ImageAnalysisResult } from '../types/perfume';
import perfumePersonas from '../data/perfumePersonas';
import { perfumes } from '../data/perfumeData';

/**
 * 향수 특성 점수에서 가장 높은 값을 가진 카테고리를 결정합니다.
 * 동점인 경우 먼저 나오는 카테고리를 선택합니다.
 */
export function determinePerfumeCategory(characteristics: PerfumeCharacteristics): PerfumeCategory {
  const entries = Object.entries(characteristics) as [PerfumeCategory, number][];
  const maxEntry = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max, 
    ['citrus', 0] as [PerfumeCategory, number]
  );
  
  return maxEntry[0];
}

/**
 * 카테고리별 한글 이름을 반환합니다.
 */
export function getCategoryKoreanName(category: PerfumeCategory): string {
  const categoryNames: Record<PerfumeCategory, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  return categoryNames[category];
}

/**
 * 이미지 분석 결과에 따라 가장 적합한 향수를 찾습니다.
 * 특성(traits) 점수의 코사인 유사도를 기반으로 매칭합니다.
 * 중요 특성에 더 높은 가중치를 적용하고, 큰 차이에 패널티를 부여합니다.
 * 
 * @param analysisResult 이미지 분석 결과
 * @param topN 반환할 최대 향수 수
 * @param options 선택적 매칭 옵션 (가중치, 임계값 등)
 * @returns 매칭된 향수 목록
 */
export function findMatchingPerfumes(
  analysisResult: ImageAnalysisResult, 
  topN: number = 1,
  options: {
    weights?: Partial<Record<keyof TraitScores, number>>;
    thresholds?: Partial<Record<keyof TraitScores, number>>;
    useHybrid?: boolean;
  } = {}
) {
  if (!analysisResult || !analysisResult.traits) {
    console.error('분석 결과가 없거나 특성 점수가 없습니다.');
    return [];
  }

  // 기본 옵션 설정
  const {
    // 주요 특성에 더 높은 가중치 부여
    weights = { 
      cute: 1.5,    // 귀여움 가중치 50% 증가
      sexy: 1.2,    // 섹시함 가중치 20% 증가
      charisma: 1.2 // 카리스마 가중치 20% 증가
    },
    // 임계값 초과 시 패널티 부여할 특성
    thresholds = { 
      cute: 3.0,    // 귀여움 차이 3점 이상이면 패널티
      sexy: 3.0,    // 섹시함 차이 3점 이상이면 패널티
      charisma: 3.0 // 카리스마 차이 3점 이상이면 패널티
    },
    // 하이브리드 접근법 사용 여부
    useHybrid = true
  } = options;

  try {
    console.log('향수 매칭 시작:', { 
      availablePersonas: perfumePersonas.personas.length,
      analysisTraits: JSON.stringify(analysisResult.traits),
      matchOptions: {
        useWeightedSimilarity: Object.keys(weights).length > 0,
        useThresholdPenalty: Object.keys(thresholds).length > 0,
        useHybrid
      }
    });

    const matchResults = perfumePersonas.personas.map(persona => {
      // 유사도 계산 방식 선택
      let similarity: number;
      
      if (useHybrid) {
        // 하이브리드 접근법 (코사인 유사도 + 유클리드 거리)
        similarity = calculateHybridSimilarity(analysisResult.traits, persona.traits);
      } else {
        // 가중치 기반 코사인 유사도
        similarity = calculateWeightedTraitSimilarity(
          analysisResult.traits,
          persona.traits,
          weights
        );
        
        // 임계값 기반 패널티 적용
        similarity = applyThresholdPenalty(
          similarity,
          analysisResult.traits,
          persona.traits,
          thresholds
        );
      }

      // perfumeData.ts에서 해당 ID에 맞는 실제 향수 정보 찾기
      const actualPerfume = perfumes.find(p => p.id === persona.id);
      
      // persona와 actualPerfume 정보 합치기
      const enhancedPersona = {
        ...persona,
        // 실제 향수에서 향료 정보 가져오기
        mainScent: actualPerfume?.mainScent || null,
        subScent1: actualPerfume?.subScent1 || null,
        subScent2: actualPerfume?.subScent2 || null
      };

      return {
        perfumeId: persona.id,
        persona: enhancedPersona, // 향수 정보가 보강된 persona 객체
        score: similarity,
        matchReason: generateMatchReason(analysisResult, enhancedPersona, actualPerfume)
      };
    });

    // 유사도 점수가 높은 순으로 정렬
    const sortedResults = matchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    console.log(`향수 매칭 완료: ${sortedResults.length}개 결과 반환, 최고 점수: ${sortedResults[0]?.score.toFixed(2)}`);
    
    return sortedResults;
  } catch (error) {
    console.error('향수 매칭 오류:', error);
    return [];
  }
}

/**
 * 기존 코사인 유사도 계산 함수
 */
function calculateTraitSimilarity(traitsA: TraitScores, traitsB: TraitScores): number {
  const keysA = Object.keys(traitsA) as Array<keyof TraitScores>;
  
  // 벡터의 내적 계산
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const key of keysA) {
    dotProduct += traitsA[key] * traitsB[key];
    normA += traitsA[key] * traitsA[key];
    normB += traitsB[key] * traitsB[key];
  }
  
  // 코사인 유사도 계산 (0으로 나누기 방지)
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  // NaN 방지 및 0~1 범위로 제한
  return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
}

/**
 * 가중치 기반 코사인 유사도 계산 함수
 * 특정 특성에 더 높은 가중치를 부여하여 그 특성의 유사성을 더 중요하게 반영
 * 
 * @param traitsA 첫 번째 특성 점수
 * @param traitsB 두 번째 특성 점수
 * @param weights 특성별 가중치 (기본값: 모든 특성 가중치 1.0)
 */
function calculateWeightedTraitSimilarity(
  traitsA: TraitScores, 
  traitsB: TraitScores, 
  weights: Partial<Record<keyof TraitScores, number>> = {}
): number {
  const keysA = Object.keys(traitsA) as Array<keyof TraitScores>;
  
  // 기본 가중치 설정 (모든 특성 가중치 1.0)
  const defaultWeights: Record<keyof TraitScores, number> = {
    sexy: 1.0,
    cute: 1.0,
    charisma: 1.0,
    darkness: 1.0,
    freshness: 1.0,
    elegance: 1.0,
    freedom: 1.0,
    luxury: 1.0,
    purity: 1.0,
    uniqueness: 1.0,
    ...weights // 사용자 지정 가중치로 덮어쓰기
  };
  
  // 가중치 적용된 벡터의 내적 계산
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (const key of keysA) {
    const weight = defaultWeights[key] || 1.0;
    const weightedA = traitsA[key] * weight;
    const weightedB = traitsB[key] * weight;
    
    dotProduct += weightedA * weightedB;
    normA += weightedA * weightedA;
    normB += weightedB * weightedB;
  }
  
  // 코사인 유사도 계산
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
}

/**
 * 임계값 기반 패널티 적용 함수
 * 특정 특성의 차이가 임계값을 초과하면 유사도에 패널티 적용
 * 
 * @param similarity 계산된 유사도 값
 * @param traitsA 첫 번째 특성 점수
 * @param traitsB 두 번째 특성 점수
 * @param thresholds 특성별 임계값 (기본값: 모든 특성 임계값 3.0)
 */
function applyThresholdPenalty(
  similarity: number, 
  traitsA: TraitScores, 
  traitsB: TraitScores, 
  thresholds: Partial<Record<keyof TraitScores, number>> = {}
): number {
  const keysA = Object.keys(traitsA) as Array<keyof TraitScores>;
  let penaltyCount = 0;
  
  // 기본 임계값 설정 (모든 특성 임계값 3.0)
  const defaultThresholds: Record<keyof TraitScores, number> = {
    sexy: 3.0,
    cute: 3.0,
    charisma: 3.0,
    darkness: 3.0,
    freshness: 3.0,
    elegance: 3.0,
    freedom: 3.0,
    luxury: 3.0,
    purity: 3.0,
    uniqueness: 3.0,
    ...thresholds // 사용자 지정 임계값으로 덮어쓰기
  };
  
  // 각 특성에 대해 임계값 이상 차이나는지 확인
  for (const key of keysA) {
    const diff = Math.abs(traitsA[key] - traitsB[key]);
    if (diff > defaultThresholds[key]) {
      penaltyCount++;
      console.log(`패널티 적용: ${key} 특성 차이 ${diff.toFixed(1)} > 임계값 ${defaultThresholds[key].toFixed(1)}`);
    }
  }
  
  // 패널티 적용: 임계값 이상 차이나는 특성당 15%씩 유사도 감소
  const penaltyFactor = Math.max(0, 1 - (penaltyCount * 0.15));
  const penalizedSimilarity = similarity * penaltyFactor;
  
  if (penaltyCount > 0) {
    console.log(`임계값 패널티: ${penaltyCount}개 특성에 패널티 적용, 유사도 ${similarity.toFixed(2)} → ${penalizedSimilarity.toFixed(2)}`);
  }
  
  return penalizedSimilarity;
}

/**
 * 하이브리드 유사도 계산 함수 (코사인 유사도 + 유클리드 거리)
 * 코사인 유사도는 방향성을 고려하고, 유클리드 거리는 절대적 차이를 고려
 * 
 * @param traitsA 첫 번째 특성 점수
 * @param traitsB 두 번째 특성 점수
 * @param cosineWeight 코사인 유사도 가중치 (0~1)
 */
function calculateHybridSimilarity(
  traitsA: TraitScores, 
  traitsB: TraitScores, 
  cosineWeight: number = 0.6
): number {
  // 코사인 유사도 계산 (방향성 고려)
  const cosineSimilarity = calculateTraitSimilarity(traitsA, traitsB);
  
  // 유클리드 거리 계산 (절대적 차이 고려)
  const keysA = Object.keys(traitsA) as Array<keyof TraitScores>;
  let sumSquaredDiff = 0;
  
  for (const key of keysA) {
    const diff = traitsA[key] - traitsB[key];
    sumSquaredDiff += diff * diff;
  }
  
  const euclideanDistance = Math.sqrt(sumSquaredDiff);
  // 최대 거리는 루트(10 * (10-1)^2) = 루트(900) = 30
  // 유클리드 거리를 0-1 범위의 유사도로 변환 (거리가 멀수록 유사도 낮음)
  const maxDistance = Math.sqrt(keysA.length * Math.pow(10 - 1, 2));
  const euclideanSimilarity = 1 - (euclideanDistance / maxDistance);
  
  // 코사인 유사도와 유클리드 유사도를 가중 평균하여 최종 유사도 계산
  const hybridSimilarity = (cosineSimilarity * cosineWeight) + (euclideanSimilarity * (1 - cosineWeight));
  
  console.log(`하이브리드 유사도: 코사인 ${cosineSimilarity.toFixed(2)} (${(cosineWeight*100).toFixed()}%), 유클리드 ${euclideanSimilarity.toFixed(2)} (${((1-cosineWeight)*100).toFixed()}%) → ${hybridSimilarity.toFixed(2)}`);
  
  return hybridSimilarity;
}

/**
 * 매칭 이유 생성 함수
 * 이미지 분석 결과와 향수의 특성을 비교하여 매칭 이유를 상세하게 설명합니다.
 * 주접 떠는 전문가 말투로 향수 정보를 설명합니다.
 * 
 * @param analysisResult 이미지 분석 결과
 * @param persona 향수 페르소나 (향료 정보 포함된 개선된 버전)
 * @param actualPerfume 실제 향수 데이터 (백업용)
 * @returns 매칭 이유 설명 문자열
 */
function generateMatchReason(
  analysisResult: ImageAnalysisResult, 
  persona: PerfumePersona & { mainScent?: any, subScent1?: any, subScent2?: any },
  actualPerfume?: Perfume
): string {
  try {
    // 향수 코드와 이름 준비
    const perfumeCode = persona.id || "Unknown";
    const perfumeName = persona.name || "향수";
    
    // 주요 카테고리와 점수 찾기
    const categoryInfo = persona.categories ? 
      Object.entries(persona.categories)
        .sort(([, a], [, b]) => b - a)[0] : null;
    
    let categoryName = 'unknown';
    let score = 5;
    
    if (categoryInfo) {
      categoryName = categoryInfo[0];
      score = categoryInfo[1];
    }
    
    // 계절 특성 - 점수에 따른 차등 추천 (절대 4개 모두 선택 안 됨)
    const seasonRecommendation = (() => {
      if (categoryName === 'citrus') {
        if (score >= 8) return '여름';           // 매우 강함: 1개
        if (score >= 6) return '봄, 여름';       // 강함: 2개
        return '봄, 여름, 가을';                 // 보통: 3개 (겨울 제외)
      } else if (categoryName === 'fruity') {
        if (score >= 8) return '여름';           
        if (score >= 6) return '봄, 여름';       
        return '봄, 여름, 가을';                 
      } else if (categoryName === 'woody') {
        if (score >= 8) return '겨울';           
        if (score >= 6) return '가을, 겨울';     
        return '여름, 가을, 겨울';               // 봄 제외
      } else if (categoryName === 'spicy') {
        if (score >= 8) return '겨울';           
        if (score >= 6) return '가을, 겨울';     
        return '여름, 가을, 겨울';               
      } else if (categoryName === 'floral') {
        if (score >= 8) return '봄';             
        if (score >= 6) return '봄, 여름';       
        return '봄, 여름, 가을';                 
      } else { // musky or unknown
        if (score >= 8) return '겨울';           
        if (score >= 6) return '가을, 겨울';     
        return '봄, 가을, 겨울';                 // 여름 제외
      }
    })();
    
    // 시간대 특성 - 점수에 따른 차등 추천 (절대 4개 모두 선택 안 됨)
    const timeRecommendation = (() => {
      if (categoryName === 'citrus') {
        if (score >= 8) return '오전';           // 매우 상쾌함
        if (score >= 6) return '오전, 오후';     
        return '오전, 오후, 저녁';               // 밤 제외
      } else if (categoryName === 'fruity') {
        if (score >= 8) return '오전';           
        if (score >= 6) return '오전, 오후';     
        return '오전, 오후, 저녁';               
      } else if (categoryName === 'woody') {
        if (score >= 8) return '밤';             // 매우 깊음
        if (score >= 6) return '저녁, 밤';       
        return '오후, 저녁, 밤';                 // 오전 제외
      } else if (categoryName === 'musky') {
        if (score >= 8) return '밤';             
        if (score >= 6) return '저녁, 밤';       
        return '오후, 저녁, 밤';                 
      } else if (categoryName === 'floral') {
        if (score >= 8) return '오후';           // 우아한 시간
        if (score >= 6) return '오전, 오후';     
        return '오전, 오후, 저녁';               
      } else { // spicy or unknown
        if (score >= 8) return '저녁';           // 강렬한 시간
        if (score >= 6) return '저녁, 밤';       
        return '오전, 저녁, 밤';                 // 오후 제외
      }
    })();
    
    // 향 카테고리 한글 이름
    const categoryNameMap: Record<string, string> = {
      citrus: '시트러스',
      floral: '플로럴',
      woody: '우디',
      musky: '머스크',
      fruity: '프루티',
      spicy: '스파이시'
    };
    
    // 가장 높은 특성 3가지 찾기
    const topTraits = persona.traits ?
      Object.entries(persona.traits)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key]) => key) : [];
    
    // 이미지 분석 결과에서 가장 높은 특성 2가지 찾기
    const topAnalysisTraits = Object.entries(analysisResult.traits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([key]) => key);
    
    // 특성 이름을 한글로 변환
    const traitNameMap: Record<string, string> = {
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
    
    // 이미지와 향수의 매칭 특성 찾기
    const matchingTraits = topTraits.filter(trait => 
      topAnalysisTraits.includes(trait)
    );
    
    // 문장 변형을 위한 감탄사 및 표현 모음
    const exclamations = [
      "오마이갓!",
      "와우! 정말 놀라워요!",
      "아니 이게 말이 돼요?",
      "믿기지가 않아요!",
      "이런 향기 조합은 처음이에요!"
    ];
    
    const flatteryPhrases = [
      "당신의 이미지와 완벽한 케미를 자랑하는",
      "당신을 위해 태어난 듯한",
      "당신의 분위기를 한 단계 업그레이드해줄",
      "당신의 특별함을 더욱 빛나게 해줄"
    ];
    
    // 랜덤 선택 함수
    const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // 향수 노트 정보 - 향료 정보가 있는 확장된 persona 객체 사용
    const topNote = persona.mainScent?.name || actualPerfume?.mainScent?.name || perfumeName;
    const middleNote = persona.subScent1?.name || actualPerfume?.subScent1?.name || '';
    const baseNote = persona.subScent2?.name || actualPerfume?.subScent2?.name || '';
    
    // 향수 설명 구성
    // 1. 소개 및 향수 코드 강조
    const introduction = `${getRandomItem(exclamations)} 제가 당신을 위해 찾아낸 이 특별한 향수 코드 "${perfumeCode}"를 주목해주세요! 이 향수는 ${getRandomItem(flatteryPhrases)} 향수로, ${categoryNameMap[categoryName] || '독특한'} 계열의 아름다움이 물씬 느껴집니다.`;
    
    // 2. 향료 설명 - 노트 피라미드
    const notesDescription = `탑 노트에서는 ${topNote}의 ${getScent(topNote)}가 당신을 첫 만남에서 사로잡고, 중간 노트로 이어지면 ${middleNote}의 ${getScent(middleNote)}가 서서히 피어올라 향의 특성을 더욱 깊게 표현합니다. 베이스 노트에서는 ${baseNote}의 ${getScent(baseNote)}가 오랫동안 당신을 감싸안으며 매력적인 잔향을 남겨줄 거예요.`;
    
    // 3. 매칭 이유 - 이미지 특성과 향수 특성 연결
    const matchingReason = matchingTraits.length > 0 
      ? `당신의 이미지에서 느껴지는 ${topAnalysisTraits.map(trait => traitNameMap[trait] || trait).join(', ')}은(는) 이 향수의 ${matchingTraits.map(trait => traitNameMap[trait] || trait).join(', ')}과(와) 놀라운 시너지를 만들어냅니다.`
      : `당신의 이미지에서 느껴지는 ${topAnalysisTraits.map(trait => traitNameMap[trait] || trait).join(', ')}에 ${topTraits.map(trait => traitNameMap[trait] || trait).join(', ')}을(를) 더해 균형잡힌 매력을 완성해줍니다.`;
    
    // 4. 분위기 연결 - 이미지 분석 결과의 분위기와 향수 연결
    const moodConnection = analysisResult.analysis?.mood
      ? `"${analysisResult.analysis.mood}"라는 당신의 분위기는 ${perfumeCode}의 ${categoryNameMap[categoryName] || '특별한'} 향과 만나 더욱 깊은 아우라를 형성할 거예요.`
      : `당신의 독특한, 말로는 다 표현할 수 없는 분위기는 이 향수의 복합적인 노트들과 어우러져 당신만의 시그니처가 될 거예요.`;
    
    // 5. 사용 추천 - 계절, 시간, 상황
    const usageRecommendation = `이 향수는 ${seasonRecommendation}에 특히 빛을 발하며, ${timeRecommendation}에 뿌리면 향의 특성이 가장 완벽하게 발현됩니다. 특히 ${getOccasion(categoryName)}에 사용하면 당신의 특별함이 한층 더 돋보일 거예요.`;
    
    // 6. 마무리 - 향수 코드 다시 한번 강조
    const conclusion = `정말이지, 향수 코드 "${perfumeCode}"는 단순한 향수가 아니라 당신의 개성을 완성하는 마지막 퍼즐 조각이에요. 이 향기의 매력에 빠져보세요!`;
    
    // 최종 설명 조합
    return `${introduction}\n\n${notesDescription}\n\n${matchingReason} ${moodConnection}\n\n${usageRecommendation}\n\n${conclusion}`;
    
  } catch (error) {
    console.error('매칭 이유 생성 중 오류:', error);
    return `이 향수는 당신의 이미지와 완벽한 조화를 이룹니다. 향의 세계로 빠져보세요.`;
  }
}

/**
 * 향료명에 따른 향 특징 설명을 반환합니다.
 */
function getScent(scentName: string): string {
  const scentDescriptions: Record<string, string[]> = {
    '오렌지 블라썸': ['화사하고 깨끗한 향', '달콤한 꽃향기', '상큼한 시트러스 뉘앙스'],
    '베르가못': ['산뜻한 시트러스 향', '생동감 넘치는 향', '상큼한 과일향'],
    '핑크페퍼': ['스파이시하면서도 달콤한 향', '매콤달콤한 후추향', '강렬한 매력'],
    '로즈': ['우아하고 깊은 꽃향기', '클래식한 장미향', '부드러운 플로럴 향'],
    '자스민': ['관능적인 꽃향기', '풍부한 화이트 플로럴', '매혹적인 향'],
    '바다소금': ['미네랄한 청량감', '해변의 짭조름한 공기', '깨끗한 향'],
    '샌달우드': ['따뜻하고 크리미한 나무향', '깊이 있는 우디 향', '부드러운 스파이시함'],
    '머스크': ['부드럽고 감싸안는 향', '포근한 잔향', '관능적인 베이스 노트'],
    '앰버우드': ['따뜻하고 달콤한 향', '레진의 깊이감', '오래 지속되는 깊은 향'],
    '바질': ['허브의 신선함', '아로마틱한 그린 향', '프레시한 허브향'],
    '민트': ['상쾌한 청량감', '시원한 브리즈', '깨끗한 허브향'],
    '유자': ['상큼한 시트러스 향', '한국적인 감귤 향', '생기 넘치는 향'],
    '라임': ['톡 쏘는 시트러스 향', '활기찬 과일향', '청량한 향'],
    '캐럿': ['신선한 뿌리채소 향', '대지의 생명력', '건강한 그린 향'],
    '비터 오렌지': ['쌉싸래한 시트러스 향', '강렬한 오렌지 향', '어덜트한 시트러스 향'],
    '튤립': ['맑고 순수한 플로럴 향', '봄의 신선함', '청아한 꽃향기'],
    '은방울꽃': ['청초하고 순백의 향', '섬세한 플로럴 향', '투명한 꽃향기'],
    '화이트로즈': ['깨끗하고 순수한 장미향', '우아한 플로럴 향', '섬세한 꽃향기'],
    '튜베로즈': ['관능적이고 농밀한 향', '풍부한 화이트 플로럴', '매혹적인 꽃향기'],
    '프리지아': ['신선하고 투명한 향', '달콤하면서도 상큼한 꽃향기', '밝은 플로럴 향'],
    '레몬페퍼': ['상큼하면서도 스파이시한 향', '톡 쏘는 시트러스 향', '생동감 있는 향'],
    '타임': ['허브의 아로마틱한 향', '숲속 야생 허브 향', '지속적인 허브 향'],
  };
  
  // 일치하는 향료명이 있으면 그 설명 중 하나를 랜덤하게 반환
  if (scentName in scentDescriptions) {
    const descriptions = scentDescriptions[scentName];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  // 일치하는 향료명이 없으면 기본 설명 생성
  const defaultDescriptions = [
    '독특한 매력', '특별한 향기', '매혹적인 향', '깊이 있는 향', 
    '부드러운 향조', '인상적인 향', '감각적인 노트'
  ];
  
  return defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];
}

/**
 * 향 카테고리별 적합한 상황을 반환합니다.
 */
function getOccasion(category: string): string {
  const occasions: Record<string, string[]> = {
    'citrus': [
      '산뜻한 오전 미팅', '활기찬 바캉스', '스포티한 데이트', 
      '가벼운 브런치', '산책과 같은 야외 활동'
    ],
    'floral': [
      '로맨틱한 디너', '갤러리 오프닝', '우아한 파티', 
      '특별한 모임', '웨딩 게스트'
    ],
    'woody': [
      '중요한 비즈니스 미팅', '고급 레스토랑 디너', '포멀한 이브닝 모임', 
      '가을 나들이', '차분한 대화의 자리'
    ],
    'musky': [
      '특별한 밤 자리', '매혹적인 데이트', '고급스러운 칵테일 파티', 
      '프라이빗한 만남', '낭만적인 이브닝'
    ],
    'fruity': [
      '밝고 경쾌한 모임', '봄날의 피크닉', '화사한 런치 데이트', 
      '쇼핑', '즐거운 친구와의 만남'
    ],
    'spicy': [
      '격식 있는 디너', '중요한 프레젠테이션', '가을과 겨울의 특별한 날', 
      '자신감이 필요한 순간', '인상적인 첫 만남'
    ]
  };
  
  if (category in occasions) {
    const categoryOccasions = occasions[category];
    return categoryOccasions[Math.floor(Math.random() * categoryOccasions.length)];
  }
  
  const defaultOccasions = [
    '특별한 모임', '중요한 자리', '데이트', '일상적인 향기 표현', '나만의 시간'
  ];
  
  return defaultOccasions[Math.floor(Math.random() * defaultOccasions.length)];
}

/**
 * 커스텀 향수 이름 생성
 * @param userName 사용자 이름
 * @param idolName 아이돌 이름
 * @param perfumeBase 기본 향수 이름
 * @returns 생성된 커스텀 향수 이름
 */
export function generateCustomPerfumeName(
  userName: string,
  idolName: string,
  perfumeBase: string
): string {
  return `${userName}의 ${idolName} 향수`;
}

/**
 * 모든 향수 정보를 불러오는 함수 - 클라이언트 측에서는 API를 통해 가져옴
 */
export async function getAllPerfumes(): Promise<Perfume[]> {
  try {
    const response = await fetch('/api/perfumes');
    if (!response.ok) {
      throw new Error('향수 데이터를 불러오는데 실패했습니다.');
    }
    const data = await response.json();
    return data.perfumes;
  } catch (error) {
    console.error('향수 데이터를 불러오는 중 오류 발생:', error);
    return [];
  }
}

/**
 * ID로 향수 찾기 - 클라이언트 측에서는 API를 통해 가져옴
 */
export async function getPerfumeById(id: string): Promise<Perfume | null> {
  try {
    const response = await fetch(`/api/perfume?id=${id}`);
    if (!response.ok) {
      throw new Error('향수 정보를 불러오는데 실패했습니다.');
    }
    const data = await response.json();
    return data.perfume;
  } catch (error) {
    console.error('향수 정보를 불러오는 중 오류 발생:', error);
    return null;
  }
}

/**
 * 향수 ID 추출하기
 * 예: "추천 향수: AC'SCENT 01 블랙베리"에서 "AC'SCENT 01" 추출
 */
export function extractPerfumeId(recommendation: string): string | null {
  // 다양한 형식 처리를 위한 정규식 패턴
  const patterns = [
    /추천 향수:\s*([A-Z]{2}-\d{7})/i, // "추천 향수: AC'SCENT 01"
    /향수 ID:\s*([A-Z]{2}-\d{7})/i,   // "향수 ID: AC'SCENT 01"
    /([A-Z]{2}-\d{7})\s*\(/i,         // "AC'SCENT 01 (블랙베리)"
    /([A-Z]{2}-\d{7})/i               // 그냥 ID만 있는 경우
  ];
  
  for (const pattern of patterns) {
    const match = recommendation.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * persona 데이터의 categories를 기반으로 주요 카테고리를 계산합니다.
 */
export function getMainCategoryFromPersona(personaId: string): PerfumeCategory | null {
  const persona = perfumePersonas.personas.find(p => p.id === personaId);
  if (!persona || !persona.categories) return null;
  
  const entries = Object.entries(persona.categories) as [PerfumeCategory, number][];
  const sortedEntries = entries.sort(([, a], [, b]) => b - a);
  return sortedEntries[0]?.[0] || null;
}

/**
 * perfumePersonas.ts 데이터를 기반으로 카테고리별 향수를 필터링합니다.
 */
export function getPerfumesByPersonaCategory(category: PerfumeCategory): string[] {
  return perfumePersonas.personas
    .filter(persona => {
      const mainCategory = getMainCategoryFromPersona(persona.id);
      return mainCategory === category;
    })
    .map(persona => persona.id);
}

/**
 * 모든 향수의 주요 카테고리를 persona 데이터 기반으로 계산합니다.
 */
export function getAllPerfumeCategoriesFromPersonas(): Record<string, PerfumeCategory> {
  const result: Record<string, PerfumeCategory> = {};
  
  perfumePersonas.personas.forEach(persona => {
    const mainCategory = getMainCategoryFromPersona(persona.id);
    if (mainCategory) {
      result[persona.id] = mainCategory;
    }
  });
  
  return result;
} 