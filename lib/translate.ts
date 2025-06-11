import { Translate } from '@google-cloud/translate/build/src/v2';

// Google Cloud Translation API 클라이언트 초기화
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  key: process.env.GOOGLE_CLOUD_API_KEY,
});

/**
 * 단일 텍스트 번역
 * @param text - 번역할 텍스트
 * @param targetLanguage - 대상 언어 (기본값: 'en')
 * @returns Promise<string> - 번역된 텍스트
 */
export async function translateText(
  text: string, 
  targetLanguage: string = 'en'
): Promise<string> {
  try {
    if (!text || text.trim() === '') {
      return text;
    }

    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('번역 오류:', error);
    throw new Error(`번역 처리 중 오류가 발생했습니다: ${error}`);
  }
}

/**
 * 언어 감지
 * @param text - 언어를 감지할 텍스트
 * @returns Promise<string> - 감지된 언어 코드
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const [detection] = await translate.detect(text);
    return detection.language;
  } catch (error) {
    console.error('언어 감지 오류:', error);
    throw new Error(`언어 감지 중 오류가 발생했습니다: ${error}`);
  }
}

/**
 * 지원 언어 목록 가져오기
 * @returns Promise<any[]> - 지원되는 언어 목록
 */
export async function getSupportedLanguages(): Promise<any[]> {
  try {
    const [languages] = await translate.getLanguages();
    return languages;
  } catch (error) {
    console.error('언어 목록 조회 오류:', error);
    throw new Error(`언어 목록 조회 중 오류가 발생했습니다: ${error}`);
  }
}

/**
 * 주요 언어 코드 상수
 */
export const LANGUAGES = {
  KOREAN: 'ko',
  ENGLISH: 'en',
  JAPANESE: 'ja',
  CHINESE_SIMPLIFIED: 'zh-cn',
  CHINESE_TRADITIONAL: 'zh-tw',
  SPANISH: 'es',
  FRENCH: 'fr',
  GERMAN: 'de',
  RUSSIAN: 'ru',
  PORTUGUESE: 'pt',
  ITALIAN: 'it',
  THAI: 'th',
  VIETNAMESE: 'vi'
} as const;

export type LanguageCode = typeof LANGUAGES[keyof typeof LANGUAGES];