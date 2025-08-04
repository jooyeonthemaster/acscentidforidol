/**
 * Gemini API 설정 및 초기화
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiConfig } from './types';

// API 키 및 모델 설정
const apiKey = process.env.GEMINI_API_KEY;
const modelName = 'gemini-2.0-flash';

// 전역 변수
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

/**
 * 기본 Gemini 설정
 */
export const defaultGeminiConfig: GeminiConfig = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 4096,
};

/**
 * 채팅용 Gemini 설정
 */
export const chatGeminiConfig: GeminiConfig = {
  temperature: 0.8,
  maxOutputTokens: 1000,
};

/**
 * API 키 유효성 검사
 */
export function validateApiKey(): boolean {
  if (!apiKey) {
    console.error('Gemini API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.');
    return false;
  }
  return true;
}

/**
 * Gemini API 초기화 함수
 */
export function initializeGeminiAPI(): void {
  console.log('Gemini API 초기화 시작');
  
  try {
    if (!validateApiKey()) {
      throw new Error('API 키가 설정되지 않았습니다');
    }
    
    genAI = new GoogleGenerativeAI(apiKey!);
    console.log('Gemini API 초기화 완료');
    
    initializeModel();
  } catch (error) {
    console.error('Gemini API 초기화 실패:', error);
    throw new Error('Gemini API 초기화에 실패했습니다');
  }
}

/**
 * 모델 초기화 함수
 */
export function initializeModel(): void {
  console.log('모델 초기화 시작:', modelName);
  
  try {
    if (!genAI) {
      throw new Error('Gemini API가 초기화되지 않았습니다');
    }
    
    model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: defaultGeminiConfig
    });
    
    console.log('모델 초기화 완료');
  } catch (error) {
    console.error('모델 초기화 실패:', error);
    throw new Error(`모델 초기화에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 모델 인스턴스 가져오기
 */
export function getModel(): any {
  if (!model) {
    console.log('모델이 초기화되지 않았습니다. 초기화를 시도합니다.');
    initializeGeminiAPI();
  }
  
  if (!model) {
    throw new Error('Gemini 모델을 초기화할 수 없습니다.');
  }
  
  return model;
}

/**
 * API 인스턴스 가져오기
 */
export function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    console.log('API가 초기화되지 않았습니다. 초기화를 시도합니다.');
    initializeGeminiAPI();
  }
  
  if (!genAI) {
    throw new Error('Gemini API를 초기화할 수 없습니다.');
  }
  
  return genAI;
}

/**
 * 초기화 상태 확인
 */
export function isInitialized(): boolean {
  return genAI !== null && model !== null;
}

/**
 * 강제 재초기화
 */
export function forceReinitialize(): void {
  genAI = null;
  model = null;
  initializeGeminiAPI();
}

// 모듈 로딩 시 자동 초기화
try {
  initializeGeminiAPI();
} catch (error) {
  console.warn('초기화 중 오류 발생, 나중에 재시도할 수 있습니다:', error);
}