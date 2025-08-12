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
  impression?: string;
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

// 테스트용 향료 데이터 인터페이스
export interface ScentMixture {
  id: string;
  name: string;
  count: number;
  ratio: number;
}

export interface CategoryDataPoint {
  axis: string; // 카테고리 이름 (예: "시트러스")
  value: number; // 카테고리 값 (원본 향수 또는 API 추천 최종 배합 기준)
}

export interface CategoryChangeInfo {
  category: PerfumeCategory | string; // 카테고리 ID 또는 이름
  change: '강화' | '약화' | '유지' | '추가' | '제외' | '조정'; // 변경 유형
  originalValue?: number; // 변경 전 값 (옵션)
  adjustedValue?: number; // 변경 후 값 (옵션)
  reason: string; // 변경 이유 또는 API의 코멘트
}

export interface TestingGranule {
  id: string;         // 향료 ID (예: "FL-149040", "AC'SCENT 12-MOD")
  name: string;       // 향료 이름
  mainCategory: PerfumeCategory | string; // category -> mainCategory로 변경, 프롬프트와 일치
  drops: number;      // 추천 방울 수 (1-10 사이 정수)
  ratio: number;      // 전체 테스팅 레시피에서의 비율 (%)
  reason: string;     // 이 향료를 이 비율로 추천한 이유
}

export interface TestingStepDetail {
  title: string;
  description: string;
  details: string;
}

export interface TestingInstructions {
  step1: TestingStepDetail;
  step2: TestingStepDetail;
  step3: TestingStepDetail;
  caution: string;
}

export interface TestingRecipeData {
  granules: TestingGranule[];
  instructions: TestingInstructions; // 변경: 상세 단계별 안내 객체
  purpose?: string; // 프롬프트에서 AI에게 생성 요청했으므로 추가 (optional)
}

export interface ContradictionInfo {
  message: string; // 모순점에 대한 설명
  // 필요시 사용자 선택 옵션 추가 가능
  // options?: Array<{ id: string, text: string }>;
}

export interface GeminiPerfumeSuggestion {
  perfumeId: string; // 원본 향수 ID
  originalPerfumeName: string; // 원본 향수 이름
  retentionPercentage: number; // 사용자가 선택한 기존 향 유지 비율
  
  initialCategoryGraphData: CategoryDataPoint[]; // 변경 전 그래프 데이터
  adjustedCategoryGraphData: CategoryDataPoint[]; // 변경 후 (API 추천) 그래프 데이터
  
  categoryChanges: CategoryChangeInfo[]; // 향 카테고리 변화 요약 (UI 표시용)
  
  testingRecipe: TestingRecipeData | null; // 시향 테스트용 향료 조합. retentionPercentage가 100이면 null.
  
  isFinalRecipe: boolean; // 기존 향 유지 비율이 100%이거나, 테스팅이 필요 없는 경우 true
  
  // 100% 유지 시 또는 테스팅 후 최종 레시피 (기존 CustomPerfumeRecipe의 일부 필드 활용 가능)
  finalRecipeDetails?: {
    recipe10ml: ScentComponent[];
    recipe50ml: ScentComponent[];
    description: string;
    explanation: {
      rationale: string;
      expectedResult: string;
      recommendation: string;
    };
  };
  
  overallExplanation?: string; // 전체적인 추천에 대한 AI의 설명 요약
  contradictionWarning?: ContradictionInfo | null; // 피드백 간 모순 발생 시 경고
}

// 기존 CustomPerfumeRecipe는 필요에 따라 유지, 수정 또는 GeminiPerfumeSuggestion에 통합될 수 있습니다.
// 예: export interface CustomPerfumeRecipe extends Partial<GeminiPerfumeSuggestion> { ... }
// 또는 GeminiPerfumeSuggestion의 finalRecipeDetails가 CustomPerfumeRecipe의 역할을 대신할 수 있습니다.
// 현재는 GeminiPerfumeSuggestion을 중심으로 작업합니다.

// 레시피 히스토리 관련 타입들
export interface RecipeHistoryItem {
  id: string;
  sessionId: string;
  perfumeId?: string;
  originalPerfumeName?: string;
  originalPerfumeId?: string;
  testingRecipe?: TestingRecipeData;
  improvedRecipe?: GeminiPerfumeSuggestion; // 실제 데이터 구조에 맞게 추가
  finalRecipeDetails?: {
    recipe10ml: ScentComponent[];
    recipe50ml: ScentComponent[];
    description: string;
    explanation: {
      rationale: string;
      expectedResult: string;
      recommendation: string;
    };
  };
  createdAt: number;
  timestamp?: number;
  generatedAt?: number;
  isBookmarked?: boolean;
  bookmarkedAt?: number;
  selectedFromHistory?: boolean;
  reactivatedAt?: number;
  feedbackSnapshot?: PerfumeFeedback;
  feedbackSummary?: {
    mainConcerns: string;
    overallRating: number;
    retentionPercentage: number;
  };
  categoryChanges?: CategoryChangeInfo[];
  overallExplanation?: string;
}

export interface RecipeHistoryResponse {
  success: boolean;
  recipes: RecipeHistoryItem[];
  count: number;
  message: string;
  error?: string;
}

export interface RecipeActionResponse {
  success: boolean;
  message: string;
  activatedRecipe?: RecipeHistoryItem;
  isBookmarked?: boolean;
  recipe?: RecipeHistoryItem;
  error?: string;
}

export interface RecipeComparisonData {
  current?: RecipeHistoryItem;
  selected?: RecipeHistoryItem;
  differences?: {
    granules: {
      added: TestingGranule[];
      removed: TestingGranule[];
      modified: TestingGranule[];
    };
    ratioChanges: {
      category: string;
      oldRatio: number;
      newRatio: number;
      change: number;
    }[];
  };
} 