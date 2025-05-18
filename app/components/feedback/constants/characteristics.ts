import { FragranceCharacteristic, CharacteristicValue } from '@/app/types/perfume';

// 향 특성 이름 매핑
export const CHARACTERISTIC_NAMES: Record<FragranceCharacteristic, string> = {
  weight: '무게감',
  sweetness: '당도',
  freshness: '청량감',
  uniqueness: '개성'
};

// 향 특성 설명 매핑
export const CHARACTERISTIC_DESCRIPTIONS: Record<FragranceCharacteristic, string> = {
  weight: '향이 얼마나 무겁거나 가벼운지 - 가볍게 변경하고 싶으신가요, 무겁게 변경하고 싶으신가요?',
  sweetness: '향이 얼마나 달콤한지 - 덜 달콤하게 변경하고 싶으신가요, 더 달콤하게 변경하고 싶으신가요?',
  freshness: '향이 얼마나 상쾌하고 시원한지 - 더 따뜻하게 변경하고 싶으신가요, 더 시원하게 변경하고 싶으신가요?',
  uniqueness: '향이 얼마나 독특하고 특별한지 - 더 무난하게 변경하고 싶으신가요, 더 독특하게 변경하고 싶으신가요?'
};

// 향 특성 단계별 레이블
export const CHARACTERISTIC_LABELS: Record<FragranceCharacteristic, Record<CharacteristicValue, string>> = {
  weight: {
    veryLow: '훨씬 더 가볍게',
    low: '더 가볍게',
    medium: '현재 무게감 유지',
    high: '더 무겁게',
    veryHigh: '훨씬 더 무겁게'
  },
  sweetness: {
    veryLow: '훨씬 덜 달콤하게',
    low: '덜 달콤하게',
    medium: '현재 당도 유지',
    high: '더 달콤하게',
    veryHigh: '훨씬 더 달콤하게'
  },
  freshness: {
    veryLow: '훨씬 더 따뜻하게',
    low: '더 따뜻하게',
    medium: '현재 청량감 유지',
    high: '더 시원하게',
    veryHigh: '훨씬 더 시원하게'
  },
  uniqueness: {
    veryLow: '훨씬 더 무난하게',
    low: '더 무난하게',
    medium: '현재 개성 유지',
    high: '더 독특하게',
    veryHigh: '훨씬 더 독특하게'
  }
};

// 특성값을 슬라이더 값으로 변환
export const characteristicToSliderValue = (value: CharacteristicValue): number => {
  switch(value) {
    case 'veryLow': return 1;
    case 'low': return 2;
    case 'medium': return 3;
    case 'high': return 4;
    case 'veryHigh': return 5;
    default: return 3;
  }
};

// 슬라이더 값을 특성값으로 변환
export const sliderToCharacteristicValue = (value: number): CharacteristicValue => {
  switch(value) {
    case 1: return 'veryLow';
    case 2: return 'low';
    case 3: return 'medium';
    case 4: return 'high';
    case 5: return 'veryHigh';
    default: return 'medium';
  }
};