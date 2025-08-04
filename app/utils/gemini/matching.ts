/**
 * 향수 매칭 관련 로직
 */

import type { ImageAnalysisResult } from '../../types/perfume';
import type { MatchingResult } from './types';
import { calculateCosineSimilarity, findTopSimilarFields, traitNames, categoryNames } from './utils';
import perfumePersonas from '../../data/perfumePersonas';

/**
 * 이미지 분석 결과를 바탕으로 가장 유사한 향수 페르소나를 찾는 함수
 * @param analysisResult 이미지 분석 결과
 * @param topN 반환할 결과 수
 * @returns 매칭된 향수 정보 배열
 */
export function findMatchingPerfumes(analysisResult: ImageAnalysisResult, topN: number = 1): MatchingResult[] {
  if (!analysisResult || !analysisResult.traits) {
    console.error('분석 결과가 없거나 특성 점수가 없습니다.');
    return [];
  }

  try {
    console.log('향수 매칭 시작:', { 
      availablePersonas: perfumePersonas.personas.length,
      traits: JSON.stringify(analysisResult.traits)
    });

    const matchResults = perfumePersonas.personas.map(persona => {
      // 특성(traits) 간 코사인 유사도 계산 - 핵심 매칭 기준
      const traitSimilarity = calculateCosineSimilarity(
        analysisResult.traits as unknown as Record<string, number>,
        persona.traits as unknown as Record<string, number>,
        analysisResult.scentCategories as unknown as Record<string, number>,
        persona.categories as unknown as Record<string, number>,
        1.0,  // 특성 가중치 100% (특성만 사용)
        0.0   // 향 카테고리 가중치 0% (향 카테고리 사용 안 함)
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
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, topN);

    console.log(`향수 매칭 완료: ${sortedResults.length}개 결과 반환, 최고 점수: ${sortedResults[0]?.score.toFixed(2)}`);
    
    return sortedResults;
  } catch (error) {
    console.error('향수 매칭 오류:', error);
    return [];
  }
}

/**
 * 매칭 이유를 생성하는 함수
 * 이미지 분석 결과와 향수 페르소나를 비교하여 매칭 이유 설명 생성
 * 
 * @param analysisResult 이미지 분석 결과
 * @param persona 향수 페르소나
 * @returns 매칭 이유 설명 문자열
 */
export function generateMatchReason(analysisResult: ImageAnalysisResult, persona: any): string {
  try {
    // 이미지와 향수 간의 가장 유사한 특성 찾기
    const topSimilarTraits = findTopSimilarFields(
      analysisResult.traits as unknown as Record<string, number>, 
      persona.traits as unknown as Record<string, number>, 
      3
    );
    
    // 가장 높은 향 카테고리 찾기
    const topCategory = Object.entries(persona.categories)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
    
    // 유사한 특성을 바탕으로 매칭 이유 생성
    const similarTraitsText = topSimilarTraits
      .map(trait => `${traitNames[trait.key] || trait.key}(${trait.value})`)
      .join(', ');
    
    // 매칭 이유 생성
    let reason = `'${persona.name}'은(는) `;
    
    // 페르소나 키워드가 있으면 포함
    if (persona.keywords && persona.keywords.length > 0) {
      const keywords = persona.keywords.slice(0, 3).join(', ');
      reason += `${keywords}의 특성과 `;
    }
    
    // 유사한 특성 설명
    reason += `${similarTraitsText}의 특성이 당신의 이미지와 높은 유사도를 보입니다. `;
    
    // 주요 향 카테고리 설명
    reason += `${categoryNames[topCategory] || topCategory} 계열의 향이 주를 이루며, `;
    
    // 페르소나 설명 요약 (앞부분만)
    if (persona.description) {
      const shortDesc = persona.description.split('.')[0] + '.';
      reason += `${shortDesc} `;
    }
    
    // 마무리 문구
    reason += '당신의 이미지와 완벽하게 어울립니다.';
    
    return reason;
  } catch (error) {
    console.error('매칭 이유 생성 오류:', error);
    return `${persona.name}은(는) 당신의 이미지에 잘 어울리는 향수입니다.`;
  }
}

/**
 * 향수 매칭 결과 검증
 * @param results 매칭 결과 배열
 * @returns 검증된 결과 배열
 */
export function validateMatchingResults(results: MatchingResult[]): MatchingResult[] {
  return results.filter(result => {
    // 기본 검증
    if (!result.perfumeId || !result.persona || typeof result.score !== 'number') {
      console.warn('유효하지 않은 매칭 결과:', result);
      return false;
    }
    
    // 점수 범위 검증
    if (result.score < 0 || result.score > 1) {
      console.warn('점수가 범위를 벗어남:', result.score);
      return false;
    }
    
    return true;
  });
}

/**
 * 향수 매칭 결과를 점수에 따라 등급으로 분류
 * @param score 매칭 점수 (0~1)
 * @returns 등급 문자열
 */
export function getMatchingGrade(score: number): string {
  if (score >= 0.9) return '완벽 매치';
  if (score >= 0.8) return '최고 매치';
  if (score >= 0.7) return '높은 매치';
  if (score >= 0.6) return '좋은 매치';
  if (score >= 0.5) return '보통 매치';
  return '낮은 매치';
}

/**
 * 매칭 결과를 사용자 친화적 형태로 포맷
 * @param results 매칭 결과 배열
 * @returns 포맷된 결과 배열
 */
export function formatMatchingResults(results: MatchingResult[]): any[] {
  return results.map((result, index) => ({
    rank: index + 1,
    perfumeId: result.perfumeId,
    perfumeName: result.persona.name,
    score: Math.round(result.score * 100), // 백분율로 변환
    grade: getMatchingGrade(result.score),
    matchReason: result.matchReason,
    keywords: result.persona.keywords?.slice(0, 5) || [],
    primaryColor: result.persona.primaryColor,
    secondaryColor: result.persona.secondaryColor
  }));
}

/**
 * 특정 특성에 기반한 향수 필터링
 * @param results 매칭 결과 배열
 * @param traitName 특성 이름
 * @param minScore 최소 점수
 * @returns 필터링된 결과 배열
 */
export function filterByTrait(
  results: MatchingResult[], 
  traitName: string, 
  minScore: number
): MatchingResult[] {
  return results.filter(result => {
    const traitScore = (result.persona.traits as any)[traitName];
    return traitScore && traitScore >= minScore;
  });
}

/**
 * 향 카테고리에 기반한 향수 필터링
 * @param results 매칭 결과 배열
 * @param categoryName 카테고리 이름
 * @param minScore 최소 점수
 * @returns 필터링된 결과 배열
 */
export function filterByCategory(
  results: MatchingResult[], 
  categoryName: string, 
  minScore: number
): MatchingResult[] {
  return results.filter(result => {
    const categoryScore = (result.persona.categories as any)[categoryName];
    return categoryScore && categoryScore >= minScore;
  });
}