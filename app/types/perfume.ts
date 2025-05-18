// 향수 카테고리 타입
export type PerfumeCategory = 'citrus' | 'floral' | 'woody' | 'musky' | 'fruity' | 'spicy';

// 향 성분 인터페이스
export interface Scent {
  name: string;
  description: string;
}

// 향수 특성 점수 인터페이스
export interface PerfumeCharacteristics {
  citrus: number;
  floral: number;
  woody: number;
  musky: number;
  fruity: number;
  spicy: number;
}

// 향수 인터페이스
export interface Perfume {
  id: string;
  name: string;
  brandName: string;
  description: string;
  imageUrl: string;
  scentCategories: string[];
  ingredients: string[];
  features: string[];
  rating?: number;
  priceRange?: string;
  mainScent: Scent;
  subScent1: Scent;
  subScent2: Scent;
  characteristics: PerfumeCharacteristics;
  category: PerfumeCategory;
  recommendation: string;
}

// 향수 페르소나 인터페이스
export interface PerfumePersonaCollection {
  personas: PerfumePersona[];
  traitDescriptions: Record<string, string>;
  categoryDescriptions: Record<string, string>;
}

// 10가지 특성 점수 인터페이스
export interface TraitScores {
  sexy: number;        // 섹시함 (1-10)
  cute: number;        // 귀여움 (1-10)
  charisma: number;    // 카리스마 (1-10)
  darkness: number;    // 다크함 (1-10)
  freshness: number;   // 청량함 (1-10)
  elegance: number;    // 우아함 (1-10)
  freedom: number;     // 자유로움 (1-10)
  luxury: number;      // 럭셔리함 (1-10)
  purity: number;      // 순수함 (1-10)
  uniqueness: number;  // 독특함 (1-10)
}

// 향 카테고리 점수
export interface ScentCategoryScores {
  citrus: number;      // 시트러스 (1-10)
  floral: number;      // 플로럴 (1-10)
  woody: number;       // 우디 (1-10)
  musky: number;       // 머스크 (1-10)
  fruity: number;      // 프루티 (1-10)
  spicy: number;       // 스파이시 (1-10)
}

// 향수 페르소나 타입
export interface PerfumePersona {
  id: string;                   // 제품 ID
  name: string;                 // 향수명 (예: 블랙베리)
  description: string;          // 페르소나 설명
  traits: TraitScores;          // 10가지 특성 점수
  categories: ScentCategoryScores; // 향 카테고리별 점수
  keywords: string[];           // 특성 키워드
  imageAssociations: string[];  // 이미지 연관성
  primaryColor: string;         // 대표 색상 (HEX)
  secondaryColor: string;       // 보조 색상 (HEX)
  matchingColorPalette: string[]; // 어울리는 색상 팔레트
}

// 노트 정보
export interface ScentNote {
  name: string;        // 노트명
  description: string; // 노트 설명
  amount?: number;     // 기본 배합량 (그램)
}

// 퍼스널 컬러 타입
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type ToneType = 'bright' | 'light' | 'mute' | 'deep';

export interface PersonalColor {
  season: SeasonType;
  tone: ToneType;
  palette: string[];  // HEX 색상 배열
  description: string;
}

// 이미지 분석 결과 타입
export interface ImageAnalysisResult {
  traits: TraitScores;
  scentCategories: ScentCategoryScores;
  dominantColors: string[];
  personalColor: PersonalColor;
  faceShape?: string;
  expression?: string;
  analysis?: {
    mood: string;
    style: string;
    expression: string;
    concept: string;
    aura?: string;
    toneAndManner?: string;
    detailedDescription?: string;
  };
  matchingKeywords?: string[];
  imageAssociations?: string[];
  matchingPerfumes: {
    perfumeId: string;
    score: number;
    matchReason: string;
    persona?: PerfumePersona;
  }[];
  error?: string;
  customAnalysis?: string;
}

// 아이돌 정보 타입 (IdolInfoForm에서 수집한 정보)
export interface IdolInfo {
  name: string;
  group: string;
  style: string[];
  personality: string[];
  charms: string;
  image?: File | null;
}

// 향수 피드백 관련 타입들

// 카테고리 선호도 타입
export type CategoryPreference = 'increase' | 'decrease' | 'maintain';

// 향 특성 타입
export type FragranceCharacteristic = 'weight' | 'sweetness' | 'freshness' | 'uniqueness';

// 특성 값 타입
export type CharacteristicValue = 'veryLow' | 'low' | 'medium' | 'high' | 'veryHigh';

// 사용자 친화적 특성 타입
export interface UserFriendlyCharacteristics {
  [key: string]: string;
}

// 향 카테고리
export interface ScentCategory {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

// 특정 향 조정
export interface SpecificScent {
  id?: string;
  name: string;
  ratio?: number;
  action?: 'add' | 'remove';
  adjustmentType?: 'add' | 'remove';
  description?: string;
  category?: PerfumeCategory;
}

// 테스트 가이드 조합
export interface TestCombination {
  scents: string[];
  ratio: string;
}

// 테스트 가이드
export interface TestGuide {
  instructions: string;
  combinations?: TestCombination[];
  scentMixtures?: Array<{name: string, ratio: number}>;
}

// 향수 레시피 구성 요소
export interface ScentComponent {
  name: string;
  amount: string;
  percentage?: number;
}

// 레시피 컴포넌트 (Recipe 내부에서 사용되는 컴포넌트)
export interface RecipeComponent {
  name: string;
  amount: string;
  percentage: number;
}

// 커스텀 향수 레시피
export interface CustomPerfumeRecipe {
  basedOn: string;
  recipe10ml: ScentComponent[];
  recipe50ml: ScentComponent[];
  description: string;
  testGuide?: TestGuide;
  recipe?: {
    '10ml': RecipeComponent[];
    '50ml': RecipeComponent[];
  };
  explanation?: {
    rationale: string;
    expectedResult: string;
    recommendation: string;
  };
}

// 향수 피드백 데이터
export interface PerfumeFeedback {
  perfumeId: string;
  perfumeName?: string;
  impression: string;
  overallRating?: number;
  retentionPercentage?: number;
  categoryPreferences?: Record<PerfumeCategory, CategoryPreference>;
  userCharacteristics?: Record<FragranceCharacteristic, CharacteristicValue>;
  scentCategoryPreferences?: Record<string, 'increase' | 'decrease' | 'keep' | 'remove'>;
  specificScents?: SpecificScent[];
  specificScentAdjustments?: SpecificScent[];
  notes?: string;
  additionalComments?: string;
  submittedAt?: string;
} 