/**
 * Gemini 유틸리티 메인 export 파일
 * 모든 하위 모듈의 기능을 통합하여 제공
 */

// 타입 정의 export
export type {
  IdolInfo,
  GeminiConfig,
  MatchingResult,
  SimilarField,
  ChatMessage,
  Vector,
  TraitNameMapping,
  CategoryNameMapping
} from './types';

// 설정 및 초기화 관련
export {
  defaultGeminiConfig,
  chatGeminiConfig,
  validateApiKey,
  initializeGeminiAPI,
  initializeModel,
  getModel,
  getGenAI,
  isInitialized,
  forceReinitialize
} from './config';

// 프롬프트 템플릿
export {
  improvedImageAnalysisPrompt,
  createPerfumeRecommendationPrompt,
  createIdolInfoPrompt
} from './prompts';

// JSON 파서
export { SafeJSONParser } from './parser';

// 이미지 분석 관련
export {
  inferImageMimeType,
  validateAndCleanImageData,
  createAnalysisParts,
  createAnalysisConfig,
  analyzeIdolImage
} from './analysis';

// 향수 매칭 관련
export {
  findMatchingPerfumes,
  generateMatchReason,
  validateMatchingResults,
  getMatchingGrade,
  formatMatchingResults,
  filterByTrait,
  filterByCategory
} from './matching';

// 채팅 관련
export {
  askGemini,
  analyzeImage,
  recommendPerfume,
  validateChatHistory,
  summarizeChatHistory,
  createChatConfig,
  postProcessChatResponse,
  getUserFriendlyErrorMessage
} from './chat';

// 유틸리티 함수들
export {
  calculateVectorSimilarity,
  calculateCosineSimilarity,
  findTopSimilarFields,
  traitNames,
  categoryNames,
  withTimeout,
  formatChatHistory,
  deepClone,
  safeStringify,
  clamp,
  isEmptyArray,
  isEmptyObject
} from './utils';

// 편의를 위한 기본 export (기존 코드 호환성)
export { analyzeIdolImage as default } from './analysis';