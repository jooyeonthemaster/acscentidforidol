import { useState, useEffect } from 'react';
import { ImageAnalysisResult } from '@/app/types/perfume';
import { translateAnalysisResult } from '../utils/analysisTranslation';
import { generateTwitterName } from '../utils/twitterNameGenerator';

export const useResultData = (t: (key: string) => string, currentLanguage: string) => {
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [twitterName, setTwitterName] = useState<string>('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const savedResult = localStorage.getItem('analysisResult');
        const savedUserImage = localStorage.getItem('userImage');
        
        if (savedUserImage) {
          setUserImage(savedUserImage);
        }
        
        if (savedResult) {
          try {
            const parsedResult: ImageAnalysisResult = JSON.parse(savedResult);
            
            // 언어가 변경된 경우 번역 실행
            if (currentLanguage !== 'ko') {
              console.log(`${currentLanguage} 언어로 번역 시작`);
              const translated = await translateAnalysisResult(parsedResult, currentLanguage, currentLanguage);
              if (translated) {
                setTranslatedAnalysis(translated);
              } else {
                console.warn('번역에 실패했습니다. 원본 결과를 사용합니다.');
                setTranslatedAnalysis(parsedResult);
              }
            } else {
              setTranslatedAnalysis(null); // 한국어는 번역 안 함
            }
            
            // 분석 결과 저장
            setAnalysisResult(parsedResult);
            
            // 트위터스타일 이름 생성
            const twitterNameResult = generateTwitterName(parsedResult, t);
            setTwitterName(twitterNameResult);
            
            setLoading(false);
            setTimeout(() => setIsLoaded(true), 100); // 로딩 후 애니메이션을 위한 약간의 지연
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            setError(parseError instanceof Error ? parseError.message : t('error.result.format'));
            setLoading(false);
          }
        } else {
          setError(t('error.result.not.found'));
          setLoading(false);
        }
      } catch (err) {
        console.error('결과 페이지 로딩 오류:', err);
        setError(t('error.result.loading'));
        setLoading(false);
      }
    };

    fetchResult();
  }, [t, currentLanguage]);

  // 번역된 분석 결과가 없으면 원본 사용
  const displayedAnalysis = translatedAnalysis || analysisResult;

  return {
    analysisResult,
    translatedAnalysis,
    loading,
    error,
    isLoaded,
    userImage,
    twitterName,
    displayedAnalysis
  };
};