/**
 * 채팅 관련 기능
 */

import { Part } from '@google/generative-ai';
import type { ChatMessage } from './types';
import { getModel } from './config';
import { withTimeout, formatChatHistory } from './utils';
import { createPerfumeRecommendationPrompt } from './prompts';

/**
 * 텍스트로 Gemini API에 질문하기
 */
export async function askGemini(
  prompt: string, 
  history: ChatMessage[] = []
): Promise<string> {
  try {
    // 모델 인스턴스 가져오기
    const model = getModel();

    // 채팅 세션 생성
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
    });

    // 타임아웃 적용된 응답 생성
    const result = await withTimeout(
      chat.sendMessage(prompt),
      60000, // 60초 타임아웃
      '요청 시간이 초과되었습니다.'
    );
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 이미지를 분석하여 Gemini API에 질문하기
 */
export async function analyzeImage(
  imageBase64: string, 
  prompt: string
): Promise<string> {
  try {
    // 모델 인스턴스 가져오기
    const model = getModel();

    // 이미지 프롬프트 구성
    const imagePart: Part = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 추가 텍스트 프롬프트 설정
    const textPart: Part = {
      text: prompt,
    };

    // 타임아웃 적용된 응답 생성
    const result = await withTimeout(
      model.generateContent([imagePart, textPart]),
      60000, // 60초 타임아웃
      '요청 시간이 초과되었습니다.'
    );
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini 이미지 분석 오류:', error);
    throw new Error('죄송합니다. 이미지를 분석할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 이미지와 채팅 히스토리를 기반으로 향수 추천하기
 */
export async function recommendPerfume(
  imageBase64: string, 
  chatHistory: ChatMessage[]
): Promise<string> {
  try {
    // 모델 인스턴스 가져오기
    const model = getModel();

    // 이미지 파트 설정
    const imagePart: Part = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    // 챗 히스토리 텍스트로 정리
    const historyText = formatChatHistory(chatHistory);

    // 향수 추천을 위한 프롬프트 구성
    const textPart: Part = {
      text: createPerfumeRecommendationPrompt(historyText)
    };

    // 타임아웃 적용된 응답 생성
    const result = await withTimeout(
      model.generateContent([imagePart, textPart]),
      60000, // 60초 타임아웃
      '요청 시간이 초과되었습니다.'
    );
    
    // 응답 처리
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini 향수 추천 오류:', error);
    throw new Error('죄송합니다. 향수 추천을 생성할 수 없습니다. 다시 시도해주세요.');
  }
}

/**
 * 채팅 히스토리 검증
 * @param history 채팅 히스토리 배열
 * @returns 검증된 히스토리 배열
 */
export function validateChatHistory(history: any[]): ChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.filter(msg => {
    if (!msg || typeof msg !== 'object') {
      return false;
    }
    
    if (!msg.role || !msg.parts) {
      return false;
    }
    
    if (typeof msg.role !== 'string' || typeof msg.parts !== 'string') {
      return false;
    }
    
    // role이 유효한 값인지 확인
    if (!['user', 'model', 'system'].includes(msg.role)) {
      return false;
    }
    
    return true;
  });
}

/**
 * 채팅 히스토리 요약
 * @param history 채팅 히스토리 배열
 * @param maxLength 최대 길이
 * @returns 요약된 히스토리
 */
export function summarizeChatHistory(history: ChatMessage[], maxLength: number = 1000): string {
  const fullText = formatChatHistory(history);
  
  if (fullText.length <= maxLength) {
    return fullText;
  }
  
  // 최근 메시지들을 우선으로 자르기
  let summary = '';
  for (let i = history.length - 1; i >= 0; i--) {
    const msgText = `${history[i].role === 'user' ? '사용자' : 'AI'}: ${history[i].parts}\n`;
    if ((summary + msgText).length > maxLength) {
      break;
    }
    summary = msgText + summary;
  }
  
  return summary || fullText.substring(0, maxLength);
}

/**
 * 채팅 세션 생성을 위한 설정 객체 생성
 * @param history 채팅 히스토리
 * @param config 추가 설정
 * @returns 채팅 설정 객체
 */
export function createChatConfig(
  history: ChatMessage[], 
  config: { temperature?: number; maxOutputTokens?: number } = {}
) {
  return {
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    generationConfig: {
      temperature: config.temperature || 0.8,
      maxOutputTokens: config.maxOutputTokens || 1000,
    },
  };
}

/**
 * 채팅 응답 후처리
 * @param responseText 원본 응답 텍스트
 * @returns 후처리된 응답 텍스트
 */
export function postProcessChatResponse(responseText: string): string {
  if (!responseText || typeof responseText !== 'string') {
    return '';
  }
  
  // 불필요한 공백 제거
  let processed = responseText.trim();
  
  // 연속된 줄바꿈 정리
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  // 특수 마크다운 정리 (필요한 경우)
  processed = processed.replace(/\*\*\*+/g, '**');
  
  return processed;
}

/**
 * 에러 메시지 사용자 친화적으로 변환
 * @param error 원본 에러
 * @returns 사용자 친화적 에러 메시지
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (!error) {
    return '알 수 없는 오류가 발생했습니다.';
  }
  
  const errorMessage = error.message || error.toString();
  
  if (errorMessage.includes('timeout') || errorMessage.includes('시간이 초과')) {
    return '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('네트워크')) {
    return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.';
  }
  
  if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
    return '일일 사용량을 초과했습니다. 내일 다시 시도해주세요.';
  }
  
  return '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.';
}