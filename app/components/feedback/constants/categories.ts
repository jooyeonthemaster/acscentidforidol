import { PerfumeCategory } from '@/app/types/perfume';

// 카테고리 이름 매핑
export const CATEGORY_NAMES: Record<PerfumeCategory, string> = {
  citrus: '상큼한 향',
  floral: '꽃 향기',
  woody: '나무/자연 향',
  musky: '포근한 향',
  fruity: '과일 향',
  spicy: '자극적인 향'
};

// 카테고리 아이콘 매핑
export const CATEGORY_ICONS: Record<PerfumeCategory, string> = {
  citrus: '🍋',
  floral: '🌸',
  woody: '🌳',
  musky: '🧴',
  fruity: '🍎',
  spicy: '🌶️'
};

// 향수 계열 설명 추가
export const CATEGORY_DESCRIPTIONS: Record<PerfumeCategory, string> = {
  citrus: '레몬, 오렌지 같은 상큼하고 시원한 향기',
  floral: '장미, 자스민 같은 꽃의 달콤하고 부드러운 향기',
  woody: '나무, 흙, 이끼 같은 자연적이고 편안한 향기',
  musky: '따뜻하고 안정감을 주는 포근한 향기',
  fruity: '딸기, 복숭아 같은 달콤하고 상큼한 과일 향기',
  spicy: '후추, 계피 같은 강렬하고 자극적인 향기'
};

// 향료 예시 추가
export const CATEGORY_EXAMPLES: Record<PerfumeCategory, string> = {
  citrus: '레몬, 베르가못, 그레이프프루트',
  floral: '장미, 자스민, 라벤더, 튤립',
  woody: '샌달우드, 시더우드, 베티버',
  musky: '머스크, 앰버, 바닐라',
  fruity: '딸기, 복숭아, 블랙베리, 사과',
  spicy: '핑크페퍼, 시나몬, 넛메그'
};

// 선호도 텍스트 매핑
export const PREFERENCE_TEXT: Record<string, string> = {
  increase: '더 강하게',
  decrease: '더 약하게',
  maintain: '현재 유지'
};

// 향료 이름에 따라 카테고리 추정하는 함수
export const determineCategory = (name: string): PerfumeCategory => {
  name = name.toLowerCase();
  if (name.includes('시트러스') || name.includes('레몬') || name.includes('오렌지') || name.includes('자몽') || name.includes('라임') || name.includes('베르가못')) {
    return 'citrus';
  }
  if (name.includes('장미') || name.includes('자스민') || name.includes('튤립') || name.includes('플로럴') || name.includes('꽃')) {
    return 'floral';
  }
  if (name.includes('우디') || name.includes('나무') || name.includes('샌달') || name.includes('시더') || name.includes('파인')) {
    return 'woody';
  }
  if (name.includes('머스크') || name.includes('앰버') || name.includes('바닐라')) {
    return 'musky';
  }
  if (name.includes('베리') || name.includes('과일') || name.includes('사과') || name.includes('복숭아') || name.includes('딸기')) {
    return 'fruity';
  }
  if (name.includes('스파이시') || name.includes('시나몬') || name.includes('후추') || name.includes('페퍼')) {
    return 'spicy';
  }
  
  // 확실하지 않은 경우 워딩이나 특성에 따라 카테고리 배정
  if (name.includes('달콤') || name.includes('스위트')) {
    return 'fruity';
  }
  if (name.includes('상쾌') || name.includes('신선')) {
    return 'citrus';
  }
  if (name.includes('따뜻') || name.includes('포근')) {
    return 'musky';
  }
  if (name.includes('허브') || name.includes('민트')) {
    return 'woody';
  }
  
  // 기본 카테고리
  return 'woody';
};