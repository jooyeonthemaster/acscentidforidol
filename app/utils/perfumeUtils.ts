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
 * 
 * @param analysisResult 이미지 분석 결과
 * @param topN 반환할 최대 향수 수
 * @returns 매칭된 향수 목록
 */
export function findMatchingPerfumes(analysisResult: ImageAnalysisResult, topN: number = 3) {
  if (!analysisResult || !analysisResult.traits) {
    console.error('분석 결과가 없거나 특성 점수가 없습니다.');
    return [];
  }

  try {
    console.log('향수 매칭 시작:', { 
      availablePersonas: perfumePersonas.personas.length,
      analysisTraits: JSON.stringify(analysisResult.traits)
    });

    const matchResults = perfumePersonas.personas.map(persona => {
      // 특성(traits) 간 코사인 유사도 계산 - 핵심 매칭 기준
      const traitSimilarity = calculateTraitSimilarity(
        analysisResult.traits,
        persona.traits
      );

      return {
        perfumeId: persona.id,
        persona: persona,
        score: traitSimilarity,
        matchReason: generateMatchReason(analysisResult, persona)
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
 * 두 특성 점수 간의 유사도 계산 (코사인 유사도 사용)
 * @param traitsA 첫 번째 특성 점수
 * @param traitsB 두 번째 특성 점수
 * @returns 코사인 유사도 (0~1 범위)
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
 * 매칭 이유 생성 함수
 * 이미지 분석 결과와 향수의 특성을 비교하여 매칭 이유를 상세하게 설명합니다.
 * 
 * @param analysisResult 이미지 분석 결과
 * @param persona 향수 페르소나
 * @returns 매칭 이유 설명 문자열
 */
function generateMatchReason(analysisResult: ImageAnalysisResult, persona: PerfumePersona): string {
  try {
    // 가장 높은 특성 3가지 찾기
    const topTraits = Object.entries(persona.traits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);
    
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
    
    // 가장 높은 향 카테고리 찾기
    const categoryEntries = Object.entries(persona.categories);
    const topCategory = categoryEntries
      .sort(([, a], [, b]) => b - a)[0][0];
    
    // 향 카테고리 한글 이름
    const categoryNameMap: Record<string, string> = {
      citrus: '시트러스',
      floral: '플로럴',
      woody: '우디',
      musky: '머스크',
      fruity: '프루티',
      spicy: '스파이시'
    };
    
    // 향 카테고리 설명
    const categoryDescriptions: Record<string, string> = {
      citrus: '상큼하고 활기찬 에너지를 담은',
      floral: '우아하고 화사한 꽃의 향기가 퍼지는',
      woody: '깊고 따뜻한 나무 향이 감싸는',
      musky: '관능적이고 포근한 아우라를 품은',
      fruity: '달콤하고 즙이 가득한 과일의 생기와 함께하는',
      spicy: '강렬하고 자극적인 매력이 담긴'
    };
    
    // 이미지 분석에서 키워드 가져오기
    const imageKeywords = analysisResult.matchingKeywords || [];
    
    // 페르소나 키워드 활용
    const keywords = persona.keywords.slice(0, 3);
    
    // 분석 결과에서 분위기와 스타일 추출
    const mood = analysisResult.analysis?.mood || '';
    const style = analysisResult.analysis?.style || '';
    const aura = analysisResult.analysis?.aura || '';
    
    // 공통 키워드 찾기 (이미지 키워드와 향수 키워드 중 겹치는 것)
    const commonKeywords = keywords.filter(k => 
      imageKeywords.some(ik => ik.includes(k) || k.includes(ik))
    );
    
    // 향수 설명 맞춤화 (페르소나 description을 이미지 분석에 맞게 변형)
    let customDescription = persona.description;
    
    // 이미지 분석 내용을 반영하여 설명 수정
    if (mood) {
      customDescription = customDescription.replace(/분위기/g, mood);
    }
    
    if (style) {
      customDescription = customDescription.replace(/스타일/g, style);
    }
    
    // 매칭 이유 생성 (전문적이고 재미있는 형태)
    let matchReason = `'${persona.name}'은(는) `;

    // 공통 키워드가 있으면 강조
    if (commonKeywords.length > 0) {
      matchReason += `이미지에서 느껴지는 ${commonKeywords.join(', ')}의 매력과 완벽하게 어울리며, `;
    }
    
    // 향수의 특성과 이미지 특성 연결
    matchReason += `${topTraits.map(t => traitNameMap[t as keyof TraitScores] || t).join(', ')}이(가) 돋보이는 향수입니다. `;
    
    // 이미지 분석 활용
    if (topAnalysisTraits.length > 0) {
      matchReason += `당신의 이미지에서 느껴지는 ${topAnalysisTraits.map(t => traitNameMap[t as keyof TraitScores] || t).join(', ')}과(와) 시너지를 이룹니다. `;
    }
    
    // 향 카테고리 설명 
    matchReason += `${categoryDescriptions[topCategory] || ''} ${categoryNameMap[topCategory] || topCategory} 계열의 향이 주를 이루어 `;
    
    // 맞춤화된 설명 적용
    const sentences = customDescription.split('.');
    if (sentences.length > 1) {
      matchReason += sentences[0] + '. ';
    } else {
      matchReason += customDescription + ' ';
    }
    
    // 아우라 연결
    if (aura) {
      matchReason += `당신의 ${aura}와 완벽한 조화를 이룹니다.`;
    } else {
      matchReason += `당신의 이미지와 완벽한 조화를 이룹니다.`;
    }
    
    return matchReason;
  } catch (error) {
    // 오류 발생 시 기본 메시지 반환
    console.error('매칭 이유 생성 오류:', error);
    return `${persona.name}은(는) 당신의 이미지와 아이돌 성향에 잘 어울리는 향수입니다.`;
  }
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
 * 예: "추천 향수: BK-2201281 블랙베리"에서 "BK-2201281" 추출
 */
export function extractPerfumeId(recommendation: string): string | null {
  // 다양한 형식 처리를 위한 정규식 패턴
  const patterns = [
    /추천 향수:\s*([A-Z]{2}-\d{7})/i, // "추천 향수: BK-2201281"
    /향수 ID:\s*([A-Z]{2}-\d{7})/i,   // "향수 ID: BK-2201281"
    /([A-Z]{2}-\d{7})\s*\(/i,         // "BK-2201281 (블랙베리)"
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