/**
 * Gemini 유틸리티 - 새로운 모듈화된 구조로 리팩토링됨
 * 
 * 이 파일은 이전의 1586줄에서 깔끔하게 모듈화된 구조로 개선되었습니다.
 * 각 기능별로 별도 파일로 분리되어 유지보수성과 확장성이 크게 향상되었습니다.
 * 
 * 구조:
 * - types.ts: 타입 정의
 * - config.ts: API 설정 및 초기화
 * - prompts.ts: 프롬프트 템플릿
 * - parser.ts: JSON 파싱 로직
 * - analysis.ts: 이미지 분석 로직
 * - matching.ts: 향수 매칭 로직
 * - chat.ts: 채팅 관련 기능
 * - utils.ts: 유틸리티 함수들
 * - index.ts: 통합 export
 */

// 모든 기능을 새로운 모듈화된 구조에서 re-export
export * from './gemini/index';

// 기존 코드와의 호환성을 위한 명시적 export
export {
  analyzeIdolImage,
  findMatchingPerfumes,
  askGemini,
  analyzeImage,
  recommendPerfume,
  initializeGeminiAPI,
  initializeModel
} from './gemini/index';

// 기본 export (기존 코드 호환성)
export { default } from './gemini/index';