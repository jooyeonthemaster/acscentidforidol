/**
 * 이미지 분석 관련 로직
 */

import { Part } from '@google/generative-ai';
import type { ImageAnalysisResult } from '../../types/perfume';
import type { IdolInfo, GeminiConfig } from './types';
import { getModel } from './config';
import { SafeJSONParser } from './parser';
import { improvedImageAnalysisPrompt, createIdolInfoPrompt } from './prompts';

/**
 * 이미지 MIME 타입 추론
 */
export function inferImageMimeType(imageBase64: string): string {
  if (imageBase64.startsWith('/9j/')) {
    return 'image/jpeg';
  } else if (imageBase64.startsWith('iVBORw0KGgo')) {
    return 'image/png';
  } else if (imageBase64.startsWith('R0lGOD')) {
    return 'image/gif';
  } else if (imageBase64.startsWith('UklGR')) {
    return 'image/webp';
  }
  return 'image/jpeg'; // 기본값
}

/**
 * Base64 이미지 데이터 검증 및 정제
 */
export function validateAndCleanImageData(imageBase64: string): string {
  if (!imageBase64 || imageBase64.length < 100) {
    throw new Error('유효하지 않은 이미지 데이터입니다.');
  }
  
  // Base64 데이터에 접두사가 있는지 확인하고 제거
  if (imageBase64.includes('base64,')) {
    imageBase64 = imageBase64.split('base64,')[1];
  }
  
  return imageBase64;
}

/**
 * 이미지 분석을 위한 Part 객체들 생성
 */
export function createAnalysisParts(
  imageBase64: string, 
  idolInfo: IdolInfo
): Part[] {
  const mimeType = inferImageMimeType(imageBase64);
  const cleanedImageData = validateAndCleanImageData(imageBase64);
  
  // 이미지 데이터로 Part 객체 생성
  const imagePart: Part = {
    inlineData: {
      data: cleanedImageData,
      mimeType
    }
  };
  
  // 프롬프트 텍스트로 Part 객체 생성
  const promptPart: Part = {
    text: improvedImageAnalysisPrompt
  };
  
  // 아이돌 정보를 포함한 부가 정보 Part
  const idolInfoPart: Part = {
    text: createIdolInfoPrompt(idolInfo)
  };
  
  return [promptPart, imagePart, idolInfoPart];
}

/**
 * Gemini API 설정 생성
 */
export function createAnalysisConfig(): GeminiConfig {
  return {
    temperature: 0.2,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 4096,
  };
}

/**
 * 이미지 분석 함수
 * Gemini API를 사용하여 이미지와 텍스트 정보를 함께 분석
 * 
 * @param imageBase64 Base64로 인코딩된 이미지 데이터
 * @param idolInfo 아이돌 정보 (이름, 그룹 등)
 * @returns 분석 결과 객체
 */
export async function analyzeIdolImage(
  imageBase64: string,
  idolInfo: IdolInfo
): Promise<ImageAnalysisResult> {
  try {
    console.log('분석 API 요청 시작');
    
    // 모델 인스턴스 가져오기
    const model = getModel();
    
    // 분석용 Part 객체들 생성
    const parts = createAnalysisParts(imageBase64, idolInfo);
    
    // Gemini API 설정
    const geminiConfig = {
      generationConfig: createAnalysisConfig()
    };

    // Gemini API 호출
    const result = await model.generateContent(parts, geminiConfig);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('분석 API 응답 수신 완료');
    
    // 응답 처리
    const safeParser = new SafeJSONParser(responseText);
    const parsedResult = safeParser.parse();
    
    return parsedResult;
  } catch (error) {
    console.error('이미지 분석 중 오류 발생:', error);
    
    // 오류 정보를 포함한 응답 반환
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}