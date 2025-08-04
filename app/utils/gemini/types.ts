/**
 * Gemini 관련 타입 정의
 */

// 아이돌 정보 인터페이스
export interface IdolInfo {
  name: string;
  group?: string;
  style?: string[];
  personality?: string[];
  charms?: string;
}

// Gemini API 설정 인터페이스
export interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

// 매칭 결과 인터페이스
export interface MatchingResult {
  perfumeId: string;
  persona: any;
  score: number;
  matchReason: string;
}

// 유사 필드 정보 인터페이스
export interface SimilarField {
  key: string;
  value: number;
  similarity: number;
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  role: string;
  parts: string;
}

// Vector 타입 (유사도 계산용)
export type Vector = Record<string, number>;

// 특성 이름 매핑 타입
export interface TraitNameMapping {
  [key: string]: string;
}

// 향 카테고리 이름 매핑 타입
export interface CategoryNameMapping {
  [key: string]: string;
}