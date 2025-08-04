import { ImageAnalysisResult } from '@/app/types/perfume';

/**
 * 트위터스타일 이름 생성 함수
 */
export const generateTwitterName = (
  analysisResult: ImageAnalysisResult,
  t: (key: string) => string
): string => {
  if (!analysisResult || !analysisResult.traits || !analysisResult.matchingKeywords) {
    return '';
  }
  
  // 상위 3개 특성 추출
  const sortedTraits = Object.entries(analysisResult.traits)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 3)
    .map(([key]) => key);
    
  // 매칭 키워드에서 랜덤하게 2개 선택
  const randomKeywords = [...analysisResult.matchingKeywords]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
  
  // 패턴 선택 및 적용
  const patterns = [
    t('twitter.pattern.1').replace('{keyword}', randomKeywords[0] || ''),
    t('twitter.pattern.2').replace('{trait}', t(`trait.${sortedTraits[0]}`) || ''),
    t('twitter.pattern.3').replace('{keyword}', randomKeywords[0] || ''),
    t('twitter.pattern.4').replace('{keyword}', randomKeywords[0] || '').replace('{trait}', t(`trait.${sortedTraits[0]}`) || ''),
    t('twitter.pattern.5').replace('{trait}', t(`trait.${sortedTraits[0]}`) || ''),
    t('twitter.pattern.6').replace('{keyword1}', randomKeywords[0] || '').replace('{keyword2}', randomKeywords[1] || ''),
    t('twitter.pattern.7').replace('{keyword}', randomKeywords[0] || '')
  ];
  
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern;
};