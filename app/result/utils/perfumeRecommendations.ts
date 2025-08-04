import { PerfumePersona } from '@/app/types/perfume';

/**
 * 향수의 특성에 맞는 계절 추천을 반환합니다
 */
export function getSeasonRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('season.all') : '사계절';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return t ? t('season.spring_summer') : '봄, 여름';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.spicy > 6) {
    return t ? t('season.fall_winter') : '가을, 겨울';
  } else {
    return t ? t('season.all') : '사계절';
  }
}

/**
 * 향수의 특성에 맞는 시간대 추천을 반환합니다
 */
export function getTimeRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('time.anytime') : '언제든지';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return t ? t('time.morning_afternoon') : '오전, 오후';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.musky > 6) {
    return t ? t('time.evening_night') : '저녁, 밤';
  } else {
    return t ? t('time.anytime') : '언제든지';
  }
}

/**
 * 향수의 특성에 맞는 상황 추천을 반환합니다
 */
export function getOccasionRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('occasion.default') : '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6) {
    return t ? t('occasion.active') : '활기찬 바캉스, 활동적인 데이트, 산뜻한 오피스 룩';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6) {
    return t ? t('occasion.business') : '중요한 비즈니스 미팅, 고급 레스토랑 디너, 특별한 이브닝 모임';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.floral > 6) {
    return t ? t('occasion.romantic') : '로맨틱한 데이트, 웨딩 게스트, 우아한 갈라 디너';
  } else {
    return t ? t('occasion.default') : '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  }
}