/**
 * Gemini 관련 유틸리티 함수들
 */

import type { Vector, SimilarField, TraitNameMapping, CategoryNameMapping } from './types';

/**
 * 두 벡터(객체) 간의 코사인 유사도 계산
 * @param vector1 첫 번째 벡터 (키-값 쌍)
 * @param vector2 두 번째 벡터 (키-값 쌍)
 * @returns 코사인 유사도 (0~1)
 */
export function calculateVectorSimilarity(vector1: Vector, vector2: Vector): number {
  // 두 벡터에 모두 존재하는 키 찾기
  const keys = Object.keys(vector1).filter(key => key in vector2);
  
  if (keys.length === 0) {
    console.warn('두 벡터 간에 공통 키가 없습니다.');
    return 0;
  }
  
  // 내적 계산
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const key of keys) {
    const val1 = vector1[key] || 0;
    const val2 = vector2[key] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  // 0으로 나누기 방지
  if (magnitude1 === 0 || magnitude2 === 0) {
    console.warn('벡터의 크기가 0입니다.');
    return 0;
  }
  
  // 코사인 유사도 계산
  const similarity = dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  
  // NaN 방지 및 0~1 범위로 제한
  return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
}

/**
 * 코사인 유사도를 계산하는 함수
 * 특성 점수와 향 카테고리 점수를 결합하여 유사도 계산
 * 
 * @param traitScores1 첫 번째 특성 점수
 * @param traitScores2 두 번째 특성 점수
 * @param scentScores1 첫 번째 향 카테고리 점수
 * @param scentScores2 두 번째 향 카테고리 점수
 * @param traitWeight 특성 가중치 (기본 70%)
 * @param scentWeight 향 카테고리 가중치 (기본 30%)
 * @returns 코사인 유사도 (0~1)
 */
export function calculateCosineSimilarity(
  traitScores1: Vector,
  traitScores2: Vector,
  scentScores1: Vector,
  scentScores2: Vector,
  traitWeight: number = 0.7,  // 특성 가중치 (기본 70%)
  scentWeight: number = 0.3   // 향 카테고리 가중치 (기본 30%)
): number {
  // 특성 점수 유사도 계산
  const traitSimilarity = calculateVectorSimilarity(traitScores1, traitScores2);
  
  // 향 카테고리 점수 유사도 계산
  const scentSimilarity = calculateVectorSimilarity(scentScores1, scentScores2);
  
  // 가중 평균 계산
  return (traitSimilarity * traitWeight) + (scentSimilarity * scentWeight);
}

/**
 * 두 객체 간에 값이 가장 유사한 필드를 찾는 함수
 * @param obj1 첫 번째 객체
 * @param obj2 두 번째 객체
 * @param count 반환할 유사 필드 수
 * @returns 유사도가 높은 필드 배열
 */
export function findTopSimilarFields(
  obj1: Vector, 
  obj2: Vector, 
  count: number
): SimilarField[] {
  // 두 객체에 모두 존재하는 키만 사용
  const commonKeys = Object.keys(obj1).filter(key => key in obj2);
  
  // 각 키별 유사도 계산 (절대값 차이의 역수)
  const similarities = commonKeys.map(key => {
    const val1 = obj1[key] || 0;
    const val2 = obj2[key] || 0;
    const diff = Math.abs(val1 - val2);
    // 차이가 작을수록 유사도가 높음
    const similarity = 1 / (1 + diff);
    
    return {
      key,
      value: val2, // obj2의 값 사용
      similarity
    };
  });
  
  // 유사도가 높은 순으로 정렬 후 상위 N개 반환
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count);
}

/**
 * 한글 특성 이름 매핑
 */
export const traitNames: TraitNameMapping = {
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

/**
 * 향 카테고리 한글 이름 매핑
 */
export const categoryNames: CategoryNameMapping = {
  citrus: '시트러스',
  floral: '플로럴',
  woody: '우디',
  musky: '머스크',
  fruity: '프루티',
  spicy: '스파이시'
};

/**
 * 타임아웃이 적용된 Promise 생성
 * @param promise 원본 Promise
 * @param timeoutMs 타임아웃 시간 (밀리초)
 * @param errorMessage 타임아웃 시 에러 메시지
 * @returns 타임아웃이 적용된 Promise
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  errorMessage: string = '요청 시간이 초과되었습니다.'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * 채팅 히스토리를 텍스트로 변환
 * @param chatHistory 채팅 히스토리 배열
 * @returns 포맷된 텍스트 문자열
 */
export function formatChatHistory(chatHistory: Array<{ role: string, parts: string }>): string {
  return chatHistory
    .map(msg => `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.parts}`)
    .join('\n');
}

/**
 * 객체의 깊은 복사
 * @param obj 복사할 객체
 * @returns 복사된 객체
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * 안전한 JSON 문자열화
 * @param obj 문자열화할 객체
 * @param space 들여쓰기 공백 수
 * @returns JSON 문자열
 */
export function safeStringify(obj: any, space: number = 0): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch (error) {
    console.error('JSON 문자열화 실패:', error);
    return '{}';
  }
}

/**
 * 범위 내 값으로 제한
 * @param value 제한할 값
 * @param min 최솟값
 * @param max 최댓값
 * @returns 제한된 값
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 배열이 비어있는지 확인
 * @param arr 확인할 배열
 * @returns 비어있으면 true
 */
export function isEmptyArray(arr: any): boolean {
  return !Array.isArray(arr) || arr.length === 0;
}

/**
 * 객체가 비어있는지 확인
 * @param obj 확인할 객체
 * @returns 비어있으면 true
 */
export function isEmptyObject(obj: any): boolean {
  return !obj || typeof obj !== 'object' || Object.keys(obj).length === 0;
}