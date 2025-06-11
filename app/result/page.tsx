"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageAnalysisResult, PerfumePersona, TraitScores, ScentCategoryScores } from '@/app/types/perfume';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TraitRadarChart from '@/components/chart/TraitRadarChart';
import ScentRadarChart from '@/components/chart/ScentRadarChart';
import KeywordCloud from '@/components/chart/KeywordCloud';
import { useTranslationContext } from '@/app/contexts/TranslationContext';

/**
 * 향수의 특성에 맞는 계절 추천을 반환합니다
 */
function getSeasonRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('season.all') : '사계절';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return t ? t('season.spring_summer') : '봄, 여름';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.spicy > 6) {
    return t ? t('season.fall_winter') : '가을, 겨울';
  } else {
    return t ? t('season.all') : '사계절';
  }
}

/**
 * 향수의 특성에 맞는 시간대 추천을 반환합니다
 */
function getTimeRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('time.anytime') : '언제든지';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return t ? t('time.morning_afternoon') : '오전, 오후';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.musky > 6) {
    return t ? t('time.evening_night') : '저녁, 밤';
  } else {
    return t ? t('time.anytime') : '언제든지';
  }
}

/**
 * 향수의 특성에 맞는 상황 추천을 반환합니다
 */
function getOccasionRecommendation(persona?: PerfumePersona, t?: (key: string) => string): string {
  if (!persona || !persona.categories) return t ? t('occasion.default') : '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6) {
    return t ? t('occasion.active') : '활기찬 바캉스, 활동적인 데이트, 산뜻한 오피스 룩';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6) {
    return t ? t('occasion.business') : '중요한 비즈니스 미팅, 고급 레스토랑 디너, 특별한 이브닝 모임';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.floral > 6) {
    return t ? t('occasion.romantic') : '로맨틱한 데이트, 웨딩 게스트, 우아한 갈라 디너';
  } else {
    return t ? t('occasion.default') : '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  }
}

export default function ResultPage() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslationContext();
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [translatedAnalysis, setTranslatedAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'perfume'>('analysis');
  const [isLoaded, setIsLoaded] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [twitterName, setTwitterName] = useState<string>('');

  // 언어별 텍스트 반환 헬퍼 함수
  const getLocalizedText = (translations: Record<string, string>): string => {
    return translations[currentLanguage] || translations['ko'];
  };

  // 계절별 다국어 텍스트 헬퍼 함수들
  const getSeasonText = {
    spring: () => getLocalizedText({ ko: '봄', en: 'Spring', ja: '春', 'zh-cn': '春季', 'zh-tw': '春季' }),
    summer: () => getLocalizedText({ ko: '여름', en: 'Summer', ja: '夏', 'zh-cn': '夏季', 'zh-tw': '夏季' }),
    autumn: () => getLocalizedText({ ko: '가을', en: 'Autumn', ja: '秋', 'zh-cn': '秋季', 'zh-tw': '秋季' }),
    winter: () => getLocalizedText({ ko: '겨울', en: 'Winter', ja: '冬', 'zh-cn': '冬季', 'zh-tw': '冬季' })
  };

  // 시간대별 다국어 텍스트 헬퍼 함수들
  const getTimeText = {
    morning: () => getLocalizedText({ ko: '오전', en: 'Morning', ja: '朝', 'zh-cn': '上午', 'zh-tw': '上午' }),
    afternoon: () => getLocalizedText({ ko: '오후', en: 'Afternoon', ja: '午後', 'zh-cn': '下午', 'zh-tw': '下午' }),
    evening: () => getLocalizedText({ ko: '저녁', en: 'Evening', ja: '夕方', 'zh-cn': '傍晚', 'zh-tw': '傍晚' }),
    night: () => getLocalizedText({ ko: '밤', en: 'Night', ja: '夜', 'zh-cn': '夜晚', 'zh-tw': '夜晚' })
  };

  // 향료 이름을 번역하는 함수
  const translateIngredient = (ingredientName: string): string => {
    if (!ingredientName) return '';
    
    // 다국어 향료 이름 매핑
    const ingredientTranslations: Record<string, Record<string, string>> = {
      // 한국어 키
      '타임': { ko: '타임', en: 'Thyme', ja: 'タイム', 'zh-cn': '百里香', 'zh-tw': '百里香' },
      '제라늄': { ko: '제라늄', en: 'Geranium', ja: 'ゼラニウム', 'zh-cn': '天竺葵', 'zh-tw': '天竺葵' },
      '엘레미': { ko: '엘레미', en: 'Elemi', ja: 'エレミ', 'zh-cn': '榄香', 'zh-tw': '欖香' },
      '베르가못': { ko: '베르가못', en: 'Bergamot', ja: 'ベルガモット', 'zh-cn': '佛手柑', 'zh-tw': '佛手柑' },
      '만다린': { ko: '만다린', en: 'Mandarin', ja: 'マンダリン', 'zh-cn': '橘子', 'zh-tw': '橘子' },
      '오렌지': { ko: '오렌지', en: 'Orange', ja: 'オレンジ', 'zh-cn': '橙子', 'zh-tw': '橙子' },
      '레몬': { ko: '레몬', en: 'Lemon', ja: 'レモン', 'zh-cn': '柠檬', 'zh-tw': '檸檬' },
      '그레이프프루트': { ko: '그레이프프루트', en: 'Grapefruit', ja: 'グレープフルーツ', 'zh-cn': '葡萄柚', 'zh-tw': '葡萄柚' },
      '장미': { ko: '장미', en: 'Rose', ja: 'ローズ', 'zh-cn': '玫瑰', 'zh-tw': '玫瑰' },
      '자스민': { ko: '자스민', en: 'Jasmine', ja: 'ジャスミン', 'zh-cn': '茉莉', 'zh-tw': '茉莉' },
      '백합': { ko: '백합', en: 'Lily', ja: 'リリー', 'zh-cn': '百合', 'zh-tw': '百合' },
      '라벤더': { ko: '라벤더', en: 'Lavender', ja: 'ラベンダー', 'zh-cn': '薰衣草', 'zh-tw': '薰衣草' },
      '샌달우드': { ko: '샌달우드', en: 'Sandalwood', ja: 'サンダルウッド', 'zh-cn': '檀香', 'zh-tw': '檀香' },
      '시더': { ko: '시더', en: 'Cedar', ja: 'シダー', 'zh-cn': '雪松', 'zh-tw': '雪松' },
      '오크': { ko: '오크', en: 'Oak', ja: 'オーク', 'zh-cn': '橡木', 'zh-tw': '橡木' },
      '소나무': { ko: '소나무', en: 'Pine', ja: 'パイン', 'zh-cn': '松树', 'zh-tw': '松樹' },
      '머스크': { ko: '머스크', en: 'Musk', ja: 'ムスク', 'zh-cn': '麝香', 'zh-tw': '麝香' },
      '앰버': { ko: '앰버', en: 'Amber', ja: 'アンバー', 'zh-cn': '琥珀', 'zh-tw': '琥珀' },
      '바닐라': { ko: '바닐라', en: 'Vanilla', ja: 'バニラ', 'zh-cn': '香草', 'zh-tw': '香草' },
      '계피': { ko: '계피', en: 'Cinnamon', ja: 'シナモン', 'zh-cn': '肉桂', 'zh-tw': '肉桂' },
      '후추': { ko: '후추', en: 'Pepper', ja: 'ペッパー', 'zh-cn': '胡椒', 'zh-tw': '胡椒' },
      '생강': { ko: '생강', en: 'Ginger', ja: 'ジンジャー', 'zh-cn': '生姜', 'zh-tw': '生薑' }
    };
    
    // 영어 키 매핑 추가
    const englishKeys = ['thyme', 'geranium', 'elemi', 'bergamot', 'mandarin', 'orange', 'lemon', 'grapefruit', 'rose', 'jasmine', 'lily', 'lavender', 'sandalwood', 'cedar', 'oak', 'pine', 'musk', 'amber', 'vanilla', 'cinnamon', 'pepper', 'ginger'];
    const koreanKeys = Object.keys(ingredientTranslations);
    
    englishKeys.forEach((englishKey, index) => {
      if (koreanKeys[index]) {
        ingredientTranslations[englishKey] = ingredientTranslations[koreanKeys[index]];
      }
    });
    
    // 원본 이름과 소문자 변환된 이름 모두 확인
    const translation = ingredientTranslations[ingredientName] || ingredientTranslations[ingredientName.toLowerCase()];
    if (translation) {
      return getLocalizedText(translation);
    }
    
    return ingredientName;
  };

  // 분석 결과 데이터 번역 함수
  const translateAnalysisData = async (result: ImageAnalysisResult, targetLang: string) => {
    if (targetLang === 'ko') {
      // 한국어는 원본 데이터 사용
      setTranslatedAnalysis(result);
      return;
    }

    try {
      console.log('분석 데이터 번역 시작:', targetLang);
      
      // 번역할 텍스트들 수집
      const textsToTranslate: string[] = [];
      const textMapping: { [key: string]: string } = {};
      
      if (result.analysis?.mood) {
        textsToTranslate.push(result.analysis.mood);
        textMapping['mood'] = result.analysis.mood;
      }
      if (result.analysis?.style) {
        textsToTranslate.push(result.analysis.style);
        textMapping['style'] = result.analysis.style;
      }
      if (result.analysis?.expression) {
        textsToTranslate.push(result.analysis.expression);
        textMapping['expression'] = result.analysis.expression;
      }
      if (result.analysis?.concept) {
        textsToTranslate.push(result.analysis.concept);
        textMapping['concept'] = result.analysis.concept;
      }
      if (result.analysis?.aura) {
        textsToTranslate.push(result.analysis.aura);
        textMapping['aura'] = result.analysis.aura;
      }
      if (result.analysis?.toneAndManner) {
        textsToTranslate.push(result.analysis.toneAndManner);
        textMapping['toneAndManner'] = result.analysis.toneAndManner;
      }
      if (result.personalColor?.description) {
        textsToTranslate.push(result.personalColor.description);
        textMapping['personalColorDescription'] = result.personalColor.description;
      }
      
      // 키워드들 추가
      if (result.matchingKeywords && result.matchingKeywords.length > 0) {
        result.matchingKeywords.forEach((keyword, index) => {
          textsToTranslate.push(keyword);
          textMapping[`keyword_${index}`] = keyword;
        });
      }

      // 향수 매칭 데이터 추가
      if (result.matchingPerfumes && result.matchingPerfumes.length > 0) {
        result.matchingPerfumes.forEach((match, perfumeIndex) => {
          if (match.matchReason) {
            textsToTranslate.push(match.matchReason);
            textMapping[`perfume_${perfumeIndex}_matchReason`] = match.matchReason;
          }
          if (match.persona?.name) {
            textsToTranslate.push(match.persona.name);
            textMapping[`perfume_${perfumeIndex}_name`] = match.persona.name;
          }
          if (match.persona?.description) {
            textsToTranslate.push(match.persona.description);
            textMapping[`perfume_${perfumeIndex}_description`] = match.persona.description;
          }
        });
      }

      if (textsToTranslate.length === 0) {
        setTranslatedAnalysis(result);
        return;
      }

      // 번역 API 호출
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          texts: textsToTranslate, 
          targetLanguage: targetLang, 
          action: 'translate' 
        })
      });

      if (!response.ok) {
        throw new Error('번역 API 호출 실패');
      }

      const translationResult = await response.json();
      const translatedTexts = translationResult.translatedTexts || [];
      
      console.log('번역 완료:', translatedTexts.length, '개 텍스트');

      // 번역된 결과로 새로운 객체 생성
      const translatedResult = JSON.parse(JSON.stringify(result));
      let textIndex = 0;

      // 분석 데이터 번역 적용
      if (result.analysis?.mood && textIndex < translatedTexts.length) {
        translatedResult.analysis.mood = translatedTexts[textIndex++];
      }
      if (result.analysis?.style && textIndex < translatedTexts.length) {
        translatedResult.analysis.style = translatedTexts[textIndex++];
      }
      if (result.analysis?.expression && textIndex < translatedTexts.length) {
        translatedResult.analysis.expression = translatedTexts[textIndex++];
      }
      if (result.analysis?.concept && textIndex < translatedTexts.length) {
        translatedResult.analysis.concept = translatedTexts[textIndex++];
      }
      if (result.analysis?.aura && textIndex < translatedTexts.length) {
        translatedResult.analysis.aura = translatedTexts[textIndex++];
      }
      if (result.analysis?.toneAndManner && textIndex < translatedTexts.length) {
        translatedResult.analysis.toneAndManner = translatedTexts[textIndex++];
      }
      if (result.personalColor?.description && textIndex < translatedTexts.length) {
        translatedResult.personalColor.description = translatedTexts[textIndex++];
      }

      // 키워드 번역 적용
      if (result.matchingKeywords && result.matchingKeywords.length > 0) {
        translatedResult.matchingKeywords = result.matchingKeywords.map((_, index) => {
          if (textIndex < translatedTexts.length) {
            return translatedTexts[textIndex++];
          }
          return result.matchingKeywords![index];
        });
      }

      // 향수 매칭 데이터 번역 적용
      if (result.matchingPerfumes && result.matchingPerfumes.length > 0) {
        translatedResult.matchingPerfumes = result.matchingPerfumes.map((match, perfumeIndex) => {
          const translatedMatch = { ...match };
          
          if (match.matchReason && textIndex < translatedTexts.length) {
            translatedMatch.matchReason = translatedTexts[textIndex++];
          }
          
          if (match.persona) {
            translatedMatch.persona = { ...match.persona };
            if (match.persona.name && textIndex < translatedTexts.length) {
              translatedMatch.persona.name = translatedTexts[textIndex++];
            }
            if (match.persona.description && textIndex < translatedTexts.length) {
              translatedMatch.persona.description = translatedTexts[textIndex++];
            }
          }
          
          return translatedMatch;
        });
      }

      setTranslatedAnalysis(translatedResult);
      console.log('번역된 분석 데이터 설정 완료');
      
    } catch (error) {
      console.error('분석 데이터 번역 실패:', error);
      // 번역 실패 시 원본 데이터 사용
      setTranslatedAnalysis(result);
    }
  };

  // 언어 변경 감지 및 번역 처리
  useEffect(() => {
    if (analysisResult && currentLanguage) {
      translateAnalysisData(analysisResult, currentLanguage);
    }
  }, [currentLanguage, analysisResult]);

  useEffect(() => {
    // 로컬 스토리지에서 분석 결과 가져오기
    const fetchResult = async () => {
      try {
        // localStorage에서 데이터 가져오기
        const storedResult = localStorage.getItem('analysisResult');
        const storedImage = localStorage.getItem('idolImagePreview');
        
        if (storedImage) {
          setUserImage(storedImage);
        }
        
        if (storedResult) {
          try {
            const parsedResult = JSON.parse(storedResult);
            
            // 필수 필드 확인
            if (!parsedResult.traits) {
              throw new Error(t('error.result.missing.traits'));
            }
            
            // 분석 결과 저장
            setAnalysisResult(parsedResult);
            
            // 트위터스타일 이름 생성
            generateTwitterName(parsedResult);
            
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
  }, [t]);
  
  // 트위터스타일 이름 생성 함수
  const generateTwitterName = (analysisResult: ImageAnalysisResult) => {
    if (!analysisResult || !analysisResult.traits || !analysisResult.matchingKeywords) return;
    
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
    setTwitterName(selectedPattern);
  };

  const handleRestart = () => {
    router.push('/');
  };

  const handleFeedback = () => {
    router.push('/feedback');
  };

  // 캐릭터 이미지 경로 (귀여운 캐릭터 이미지로 교체 필요)
  const characterImagePath = '/cute2.png';
  const sadCharacterImagePath = '/cute2.png';

  // 번역된 분석 결과가 없으면 원본 사용
  const displayedAnalysis = translatedAnalysis || analysisResult;

  return (
    <div className="min-h-screen bg-amber-50 pt-6 pb-10 px-4">
      {/* 페이지 로딩 시 등장 애니메이션 적용된 컨테이너 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto"
      >
        {/* 헤더 */}
        <div className="relative flex justify-center mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-center mb-1">
              <span className="bg-yellow-300 px-3 py-1 inline-block rounded-lg">
                AC'SCENT IDENTITY
              </span>
            </h1>
            <p className="text-gray-800 text-sm">{t('result.intro')}</p>
          </div>
        </div>

        {loading ? (
          <div className="relative bg-white rounded-3xl border-4 border-dashed border-yellow-200 p-6 mb-6 shadow-md overflow-hidden">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="flex space-x-2 mb-4">
                <div className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-yellow-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-yellow-200 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-center text-gray-700">{t('result.loading')}</p>
            </div>
            
            {/* 오른쪽 하단 캐릭터 */}
            <div className="absolute -right-4 bottom-0 w-24 h-24">
              <Image 
                src={characterImagePath}
                alt={t('result.cuteCharacterAlt')}
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : error ? (
          <div className="relative bg-white rounded-3xl border-4 border-dashed border-red-200 p-6 mb-6 shadow-md overflow-hidden">
            <p className="text-center text-red-600 mb-4">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-500 transition font-medium text-sm"
              >
                {t('result.restart')}
              </button>
            </div>
            
            {/* 오른쪽 하단 캐릭터 - 슬픈 표정 */}
            <div className="absolute -right-4 bottom-0 w-24 h-24">
              <Image 
                src={sadCharacterImagePath}
                alt={t('result.sadCharacterAlt')}
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : displayedAnalysis ? (
          <>
            {/* 사용자 업로드 이미지 표시 */}
            {userImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <div className="rounded-2xl overflow-hidden border-4 border-yellow-200 shadow-lg">
                  <img 
                    src={userImage} 
                                            alt={t('result.analysisResult')} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            )}
            
            {/* 트위터스타일 닉네임 표시 - 로고 제거 및 디자인 개선 */}
            {twitterName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-5"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="mr-3 text-2xl">⭐</div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{twitterName}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 mb-6 shadow-md"
            >
              {/* 왼쪽 위 점 장식 */}
              <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 오른쪽 아래 캐릭터 */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="absolute -right-4 bottom-0 w-24 h-24"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image 
                    src={characterImagePath}
                    alt={t('result.cuteCharacterAlt')}
                    width={100}
                    height={100}
                    className="object-contain"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    priority
                  />
                </div>
              </motion.div>
              
              {/* 왼쪽 하단 장식 */}
              <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
              
              {/* 탭 선택 */}
              <div className="flex mb-6 border-b border-gray-200">
                <button 
                  className={`flex-1 px-3 py-2 text-sm ${activeTab === 'analysis' ? 'border-b-2 border-yellow-400 text-gray-900 font-medium' : 'text-gray-700'}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  {t('result.tab.analysis')}
                </button>
                <button 
                  className={`flex-1 px-3 py-2 text-sm ${activeTab === 'perfume' ? 'border-b-2 border-yellow-400 text-gray-900 font-medium' : 'text-gray-700'}`}
                  onClick={() => setActiveTab('perfume')}
                >
                  {t('result.tab.perfume')}
                </button>
              </div>

              {/* 이미지 분석 탭 */}
              <AnimatePresence mode="wait">
                {activeTab === 'analysis' && (
                  <motion.div 
                    key="analysis"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* 분석 요약 */}
                    {displayedAnalysis.analysis && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.mood')}</span>
                          <span className="ml-2 text-xs text-yellow-700">{t('result.analysis.aiThought')}</span>
                        </h3>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-inner">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white">
                                <span className="text-xl">💭</span>
                              </div>
                            </div>
                            <p className="text-gray-900 text-sm font-medium italic">"{displayedAnalysis.analysis.mood}"</p>
                          </div>
                          <div className="mt-4 text-right">
                            <span className="inline-block bg-white px-3 py-1 rounded-full text-xs text-amber-800 font-medium border border-amber-200">
                              @acscent_ai
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 특성 점수 - 레이더 차트 추가 */}
                    <div className="mb-16">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                        <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.traits')}</span>
                        <span className="ml-2 text-xs text-pink-700">{t('result.analysis.core')}</span>
                      </h3>
                      
                      <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm mb-4">
                        {/* 레이더 차트 부분 - 여백 적절히 조정 */}
                        {displayedAnalysis.traits && (
                          <div className="flex justify-center">
                            <div className="w-full min-h-[380px] h-auto relative mb-6">
                              <TraitRadarChart traits={displayedAnalysis.traits} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 스타일 분석 - API 응답 사용하면서 간결하게 표현 */}
                    {displayedAnalysis.analysis && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.style')}</span>
                          <span className="ml-2 text-xs text-green-700">{t('result.analysis.styleExplanation')}</span>
                        </h3>
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="grid grid-cols-1 gap-3">
                            {displayedAnalysis.analysis.style && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-pink-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-pink-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-600">
                                      <circle cx="12" cy="7" r="4"></circle>
                                      <path d="M5 21V19a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-pink-800 mb-1">{t('result.analysis.style')}</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      {t('result.analysis.styleDescription', displayedAnalysis.analysis.style)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {displayedAnalysis.analysis.expression && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-purple-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-600">
                                      <path d="M12 2c.5 0 1 .2 1.2.6l7.5 13.5c.3.5.3 1 .1 1.4-.2.5-.7.7-1.2.7H4.4c-.5 0-1-.2-1.2-.7-.2-.5-.2-1 .1-1.4L10.8 2.6c.2-.4.7-.6 1.2-.6z"></path>
                                      <path d="M12 9v4"></path>
                                      <path d="M12 17h.01"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-purple-800 mb-1">{t('result.analysis.expression')}</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      {t('result.analysis.expressionDescription', displayedAnalysis.analysis.expression)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {displayedAnalysis.analysis.concept && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-indigo-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-600">
                                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-18c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zM3 12c0 1.65 1.35 3 3 3s3-1.35 3-3-1.35-3-3-3-3 1.35-3 3z"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-indigo-800 mb-1">{t('result.analysis.concept')}</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      {t('result.analysis.conceptDescription', displayedAnalysis.analysis.concept)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 아우라 및 톤앤매너 - 추가 설명 텍스트 간소화 */}
                    {displayedAnalysis.analysis && (displayedAnalysis.analysis.aura || displayedAnalysis.analysis.toneAndManner) && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.auraAndTone')}</span>
                          <span className="ml-2 text-xs text-blue-700">{t('result.analysis.core')}</span>
                        </h3>
                        <div className="bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-inner">
                          <div className="grid grid-cols-1 gap-4">
                            {displayedAnalysis.analysis.aura && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">✨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-purple-800">{t('result.analysis.aura')}</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-800 text-sm italic">"{displayedAnalysis.analysis.aura}"</p>
                                </div>
                              </div>
                            )}
                            
                            {displayedAnalysis.analysis.toneAndManner && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">🎨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-blue-800">{t('result.analysis.toneAndManner')}</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-800 text-sm italic">"{displayedAnalysis.analysis.toneAndManner}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 매칭 키워드 */}
                    {displayedAnalysis.matchingKeywords && displayedAnalysis.matchingKeywords.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.matchingKeywords')}</span>
                          <span className="ml-2 text-xs text-orange-700">{t('result.analysis.keywordsDescription')}</span>
                        </h3>
                        <div className="bg-white rounded-xl py-3 px-4 border border-orange-200 min-h-[150px] max-h-[180px] overflow-auto">
                          <KeywordCloud keywords={displayedAnalysis.matchingKeywords} />
                        </div>
                      </div>
                    )}
                    
                    {/* 컬러 타입 */}
                    {displayedAnalysis.personalColor && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.personalColor')}</span>
                          <span className="ml-2 text-xs text-teal-700">{t('result.analysis.personalColorDescription')}</span>
                        </h3>
                        <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100 shadow-sm">
                          <div className="flex items-start mb-3">
                            <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${
                                  displayedAnalysis.personalColor.palette?.[0] || '#fff'
                                }, ${
                                  displayedAnalysis.personalColor.palette?.[1] || '#f9f9f9'
                                })`
                              }}
                            ></div>
                            <div>
                                                             <p className="text-gray-900 text-sm font-bold">
                                 {displayedAnalysis.personalColor.season} {displayedAnalysis.personalColor.tone} {t('result.personalColorType')}
                               </p>
                              <p className="text-gray-700 text-sm mt-1 italic">
                                "{displayedAnalysis.personalColor.description}"
                              </p>
                              <p className="text-pink-700 text-xs mt-2 font-medium">
                                {t('result.analysis.personalColorDescription')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {displayedAnalysis.personalColor.palette && displayedAnalysis.personalColor.palette.map((color, index) => (
                              <div 
                                key={index}
                                className="w-8 h-8 rounded-full border shadow-sm transform hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-white rounded-lg border border-pink-100">
                            <h5 className="text-xs font-bold text-pink-700 mb-2">{t('result.analysis.personalColorRecommendation')}</h5>
                            <p className="text-gray-800 text-xs">
                              {t('result.analysis.personalColorRecommendationDescription', '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 향수 추천 탭 */}
                {activeTab === 'perfume' && (
                  <motion.div 
                    key="perfume"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {displayedAnalysis.matchingPerfumes && displayedAnalysis.matchingPerfumes.length > 0 ? (
                      <>
                        {/* 매칭된 향수 정보 */}
                        {displayedAnalysis.matchingPerfumes.map((match, index) => (
                          <div key={index} className="mb-6">
                            <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
                              {/* 향수 정보 헤더 - 향수 코드 강조 */}
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 border-b border-yellow-200">
                                <div className="flex justify-between items-start">
                                  {/* 향수 코드 + 이름 섹션 */}
                                  <div className="flex flex-col">
                                    {/* 향수 코드 (강조) */}
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-700 mb-1 border-b-2 border-amber-300 inline-block pb-1">
                                      {match.persona?.id || t('result.perfume.customPerfume')}
                                    </h2>
                                    {/* 향료명 (부차적) */}
                                    <p className="text-sm text-gray-700">
                                      {match.persona?.name || ''}
                                    </p>
                                  </div>
                                  
                                  {/* 매칭 정확도 - 원형 프로그레스 */}
                                  <div className="relative h-16 w-16 flex flex-col items-center justify-center">
                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                      {/* 배경 원 */}
                                      <circle 
                                        cx="18" cy="18" r="15.91549431" 
                                        fill="none" 
                                        stroke="#e9e9e9" 
                                        strokeWidth="1"
                                      />
                                      {/* 프로그레스 원 */}
                                      <circle 
                                        cx="18" cy="18" r="15.91549431" 
                                        fill="none" 
                                        stroke={
                                          match.score >= 0.9 ? "#22c55e" : 
                                          match.score >= 0.8 ? "#3b82f6" :
                                          match.score >= 0.7 ? "#a855f7" : "#d97706"
                                        }
                                        strokeWidth="3"
                                        strokeDasharray={`${Math.round(match.score * 100)} 100`}
                                        strokeDashoffset="25"
                                        strokeLinecap="round"
                                      />
                                      <text x="18" y="18.5" textAnchor="middle" dominantBaseline="middle" 
                                        className="text-xs font-bold" fill="#374151">
                                        {Math.round(match.score * 100)}%
                                      </text>
                                    </svg>
                                    <span className="text-[10px] text-gray-700 mt-1">매칭도</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 향수 내용 - 섹션 구조화 */}
                              <div className="p-4 space-y-6">
                                {/* 향 노트 설명 (Notes) - 피라미드 형태 */}
                                <div className="mb-4">
                                  <h3 className="text-base font-semibold text-amber-900 mb-2 flex items-center">
                                    <span className="mr-2">🌿</span>
                                    <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.notes')}</span>
                                  </h3>
                                  
                                  <div className="relative pt-6">
                                    {/* Top Note */}
                                    <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 p-3 rounded-t-lg border border-yellow-200 mb-1 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-yellow-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-yellow-700 font-bold text-xs">{t('result.perfume.topNote')}</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-yellow-900">{translateIngredient(match.persona?.mainScent?.name || '') || t('result.perfume.topNoteDefault')}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            {t('result.perfume.topNoteDescription')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Middle Note */}
                                    <div className="bg-gradient-to-b from-amber-100 to-amber-50 p-3 border border-amber-200 mb-1 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-amber-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-amber-700 font-bold text-xs">{t('result.perfume.middleNote')}</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-amber-900">{translateIngredient(match.persona?.subScent1?.name || '') || t('result.perfume.middleNoteDefault')}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            {t('result.perfume.middleNoteDescription')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Base Note */}
                                    <div className="bg-gradient-to-b from-orange-100 to-orange-50 p-3 rounded-b-lg border border-orange-200 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-orange-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-orange-700 font-bold text-xs">{t('result.perfume.baseNote')}</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-orange-900">{translateIngredient(match.persona?.subScent2?.name || '') || t('result.perfume.baseNoteDefault')}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            {t('result.perfume.baseNoteDescription')}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 향 발현 타임라인 */}
                                    <div className="mt-4 pt-2 border-t border-amber-100">
                                      <h5 className="text-xs font-medium text-gray-800 mb-2">{t('result.perfume.aromaTimeline')}</h5>
                                      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="absolute left-0 top-0 h-full w-1/6 bg-yellow-300 rounded-l-full flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-yellow-900">{t('result.perfume.topNote')}</span>
                                        </div>
                                        <div className="absolute left-1/6 top-0 h-full w-3/6 bg-amber-400 flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-amber-900">{t('result.perfume.middleNote')}</span>
                                        </div>
                                        <div className="absolute right-0 top-0 h-full w-2/6 bg-orange-300 rounded-r-full flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-orange-900">{t('result.perfume.baseNote')}</span>
                                        </div>
                                      </div>
                                      <div className="flex justify-between mt-1 text-[8px] text-gray-700">
                                        <span>{t('result.perfume.topNoteDuration')}</span>
                                        <span>{t('result.perfume.middleNoteDuration')}</span>
                                        <span>{t('result.perfume.baseNoteDuration')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 향수 특성 시각화 */}
                                {match.persona?.categories && (
                                  <div className="mb-6 pt-2">
                                    <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
                                      <span className="mr-2">⚗️</span>
                                      <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.perfumeProfile')}</span>
                                    </h3>
                                    
                                    <div className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl p-4 border border-amber-100">
                                      {/* 카테고리 바 차트 */}
                                      <div className="grid grid-cols-1 gap-2 mb-4">
                                        {Object.entries(match.persona?.categories || {}).map(([category, value]) => {
                                          const categoryColors: Record<string, { bg: string, text: string, icon: string }> = {
                                            citrus: { bg: 'bg-yellow-400', text: 'text-yellow-800', icon: '🍋' },
                                            floral: { bg: 'bg-pink-400', text: 'text-pink-800', icon: '🌸' },
                                            woody: { bg: 'bg-amber-600', text: 'text-amber-900', icon: '🌳' },
                                            musky: { bg: 'bg-purple-400', text: 'text-purple-800', icon: '✨' },
                                            fruity: { bg: 'bg-red-400', text: 'text-red-800', icon: '🍎' },
                                            spicy: { bg: 'bg-orange-400', text: 'text-orange-800', icon: '🌶️' }
                                          };
                                          
                                          const categoryNames: Record<string, string> = {
                                            citrus: getLocalizedText({ ko: '시트러스', en: 'Citrus', ja: 'シトラス', 'zh-cn': '柑橘', 'zh-tw': '柑橘' }),
                                            floral: getLocalizedText({ ko: '플로럴', en: 'Floral', ja: 'フローラル', 'zh-cn': '花香', 'zh-tw': '花香' }),
                                            woody: getLocalizedText({ ko: '우디', en: 'Woody', ja: 'ウッディ', 'zh-cn': '木香', 'zh-tw': '木香' }),
                                            musky: getLocalizedText({ ko: '머스크', en: 'Musky', ja: 'ムスキー', 'zh-cn': '麝香', 'zh-tw': '麝香' }),
                                            fruity: getLocalizedText({ ko: '프루티', en: 'Fruity', ja: 'フルーティ', 'zh-cn': '果香', 'zh-tw': '果香' }),
                                            spicy: getLocalizedText({ ko: '스파이시', en: 'Spicy', ja: 'スパイシー', 'zh-cn': '辛香', 'zh-tw': '辛香' })
                                          };
                                          
                                          const color = categoryColors[category] || { bg: 'bg-gray-400', text: 'text-gray-800', icon: '⚪' };
                                          const percent = Math.min(Math.round((value as number) * 10), 100);
                                          
                                          return (
                                            <div key={category} className="flex items-center">
                                              <div className="flex-shrink-0 w-24 text-xs font-medium flex items-center mr-2">
                                                <span className="mr-1">{color.icon}</span>
                                                <span className={color.text.replace('text-yellow-800', 'text-yellow-900').replace('text-pink-800', 'text-pink-900').replace('text-amber-900', 'text-amber-950').replace('text-purple-800', 'text-purple-900').replace('text-red-800', 'text-red-900').replace('text-orange-800', 'text-orange-900')}>{categoryNames[category] || category}</span>
                                              </div>
                                              <div className="flex-grow bg-gray-200 rounded-full h-3 relative">
                                                <div 
                                                  className={`${color.bg} h-3 rounded-full`} 
                                                  style={{ width: `${percent}%` }}
                                                ></div>
                                              </div>
                                              <div className="flex-shrink-0 ml-2 text-xs font-bold text-gray-700">{value}</div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {/* 주요 카테고리 특성 */}
                                      <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
                                        <p className="text-xs text-gray-800">
                                          <span className="font-bold">{t('result.perfume.mainSeries')}:</span> {(() => {
                                            const mainCategory = Object.entries(match.persona?.categories || {})
                                              .sort(([, a], [, b]) => (b as number) - (a as number))[0];
                                            
                                            const categoryNames: Record<string, string> = {
                                              citrus: getLocalizedText({ ko: '시트러스', en: 'Citrus', ja: 'シトラス', 'zh-cn': '柑橘', 'zh-tw': '柑橘' }),
                                              floral: getLocalizedText({ ko: '플로럴', en: 'Floral', ja: 'フローラル', 'zh-cn': '花香', 'zh-tw': '花香' }),
                                              woody: getLocalizedText({ ko: '우디', en: 'Woody', ja: 'ウッディ', 'zh-cn': '木香', 'zh-tw': '木香' }),
                                              musky: getLocalizedText({ ko: '머스크', en: 'Musky', ja: 'ムスキー', 'zh-cn': '麝香', 'zh-tw': '麝香' }),
                                              fruity: getLocalizedText({ ko: '프루티', en: 'Fruity', ja: 'フルーティ', 'zh-cn': '果香', 'zh-tw': '果香' }),
                                              spicy: getLocalizedText({ ko: '스파이시', en: 'Spicy', ja: 'スパイシー', 'zh-cn': '辛香', 'zh-tw': '辛香' })
                                            };
                                            
                                            return categoryNames[mainCategory[0]] || mainCategory[0];
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* 향수 매칭 이유 및 설명 */}
                                {match.matchReason && (
                                  <div className="mb-6">
                                    <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
                                      <span className="mr-2">✨</span>
                                      <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.perfumeStory')}</span>
                                    </h3>
                                    
                                    {/* 매칭 이유 섹션 - 주접 가득한 설명 파싱 */}
                                    {(() => {
                                      try {
                                        // matchReason을 줄바꿈으로 분리하여 섹션 파싱
                                        const sections = match.matchReason.split('\n\n');
                                        const introduction = sections[0] || '';
                                        const matchingReason = sections.length > 2 ? sections[2] : '';
                                        const usageRecommendation = sections.length > 3 ? sections[3] : '';
                                        
                                        return (
                                          <div className="space-y-3">
                                            {/* 소개 */}
                                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
                                              <div className="flex">
                                                <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                                                  <span className="text-xl text-white">💬</span>
                                                </div>
                                                <div>
                                                  <h4 className="text-sm font-bold text-amber-900 mb-1">{t('result.perfume.expertEvaluation')}</h4>
                                                  <p className="text-sm italic text-amber-800">{introduction}</p>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* 매칭 이유 */}
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
                                              <h4 className="flex items-center text-sm font-bold text-indigo-900 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-1">
                                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                                </svg>
{t('result.image.perfume.matching')}
                                              </h4>
                                              <p className="text-sm text-indigo-800 italic bg-white bg-opacity-60 p-3 rounded-lg border border-indigo-100">
                                                {matchingReason}
                                              </p>
                                            </div>
                                            
                                            {/* 사용 추천 */}
                                            <div className="grid grid-cols-1 gap-3">
                                              <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                                <h4 className="flex items-center text-sm font-bold text-amber-900 mb-2">
                                                  <span className="mr-2">🕒</span>
                                                  {t('result.perfume.usageRecommendation')}
                                                </h4>
                                                <p className="text-sm text-amber-800">{usageRecommendation}</p>
                                              </div>
                                              
                                              {/* 계절 및 시간 추천 - 시각화 */}
                                              <div className="grid grid-cols-1 gap-3 mt-2">
                                                {/* 계절 추천 */}
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                                                  <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center">
                                                    <span className="mr-1">🌿</span>
                                                    {t('result.perfume.recommendedSeason')}
                                                  </h5>
                                                  <div className="flex justify-between">
                                                    {[
                                                      getLocalizedText({ ko: '봄', en: 'Spring', ja: '春', 'zh-cn': '春季', 'zh-tw': '春季' }),
                                                      getLocalizedText({ ko: '여름', en: 'Summer', ja: '夏', 'zh-cn': '夏季', 'zh-tw': '夏季' }),
                                                      getLocalizedText({ ko: '가을', en: 'Autumn', ja: '秋', 'zh-cn': '秋季', 'zh-tw': '秋季' }),
                                                      getLocalizedText({ ko: '겨울', en: 'Winter', ja: '冬', 'zh-cn': '冬季', 'zh-tw': '冬季' })
                                                    ].map((season, idx) => {
                                                      const seasonRecommendation = (() => {
                                                        const categoryEntries = Object.entries(match.persona?.categories || {})
                                                          .sort(([, a], [, b]) => (b as number) - (a as number));
                                                        
                                                        if (categoryEntries.length === 0) return [getSeasonText.spring(), getSeasonText.summer()];
                                                        
                                                        const [categoryName, score] = categoryEntries[0];
                                                        
                                                        if (categoryName === 'citrus') {
                                                          if (score >= 8) return [getSeasonText.summer()];           // 매우 강함: 1개
                                                          if (score >= 6) return [getSeasonText.spring(), getSeasonText.summer()];     // 강함: 2개
                                                          return [getSeasonText.spring(), getSeasonText.summer(), getSeasonText.autumn()];             // 보통: 3개 (겨울 제외)
                                                        } else if (categoryName === 'fruity') {
                                                          if (score >= 8) return [getSeasonText.summer()];           
                                                          if (score >= 6) return [getSeasonText.spring(), getSeasonText.summer()];     
                                                          return [getSeasonText.spring(), getSeasonText.summer(), getSeasonText.autumn()];             
                                                        } else if (categoryName === 'woody') {
                                                          if (score >= 8) return [getSeasonText.winter()];           
                                                          if (score >= 6) return [getSeasonText.autumn(), getSeasonText.winter()];   
                                                          return [getSeasonText.summer(), getSeasonText.autumn(), getSeasonText.winter()];           // 봄 제외
                                                        } else if (categoryName === 'spicy') {
                                                          if (score >= 8) return [getSeasonText.winter()];           
                                                          if (score >= 6) return [getSeasonText.autumn(), getSeasonText.winter()];   
                                                          return [getSeasonText.summer(), getSeasonText.autumn(), getSeasonText.winter()];           
                                                        } else if (categoryName === 'floral') {
                                                          if (score >= 8) return [getSeasonText.spring()];             
                                                          if (score >= 6) return [getSeasonText.spring(), getSeasonText.summer()];     
                                                          return [getSeasonText.spring(), getSeasonText.summer(), getSeasonText.autumn()];             
                                                        } else { // musky or unknown
                                                          if (score >= 8) return [getSeasonText.winter()];           
                                                          if (score >= 6) return [getSeasonText.autumn(), getSeasonText.winter()];   
                                                          return [getSeasonText.spring(), getSeasonText.autumn(), getSeasonText.winter()];             // 여름 제외
                                                        }
                                                      })();
                                                      
                                                      const isRecommended = seasonRecommendation.includes(season);
                                                      
                                                      return (
                                                        <div key={season} className="text-center">
                                                          <div className={`w-10 h-10 rounded-full ${isRecommended ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-400'} flex items-center justify-center mx-auto`}>
                                                            {idx === 0 && '🌸'}
                                                            {idx === 1 && '☀️'}
                                                            {idx === 2 && '🍂'}
                                                            {idx === 3 && '❄️'}
                                                          </div>
                                                          <p className={`text-[10px] mt-1 ${isRecommended ? 'font-bold text-emerald-900' : 'text-gray-700'}`}>
                                                            {season}
                                                          </p>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                                
                                                {/* 시간대 추천 */}
                                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                                  <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center">
                                                    <span className="mr-1">🕰️</span>
                                                    {t('result.perfume.recommendedTime')}
                                                  </h5>
                                                  <div className="flex justify-between">
                                                    {[
                                                      getLocalizedText({ ko: '오전', en: 'Morning', ja: '朝', 'zh-cn': '上午', 'zh-tw': '上午' }),
                                                      getLocalizedText({ ko: '오후', en: 'Afternoon', ja: '午後', 'zh-cn': '下午', 'zh-tw': '下午' }),
                                                      getLocalizedText({ ko: '저녁', en: 'Evening', ja: '夕方', 'zh-cn': '傍晚', 'zh-tw': '傍晚' }),
                                                      getLocalizedText({ ko: '밤', en: 'Night', ja: '夜', 'zh-cn': '夜晚', 'zh-tw': '夜晚' })
                                                    ].map((time, idx) => {
                                                      const timeRecommendation = (() => {
                                                        const categoryEntries = Object.entries(match.persona?.categories || {})
                                                          .sort(([, a], [, b]) => (b as number) - (a as number));
                                                        
                                                        if (categoryEntries.length === 0) return [getTimeText.morning(), getTimeText.afternoon()];
                                                        
                                                        const [categoryName, score] = categoryEntries[0];
                                                        
                                                        if (categoryName === 'citrus') {
                                                          if (score >= 8) return [getTimeText.morning()];           // 매우 상쾌함
                                                          if (score >= 6) return [getTimeText.morning(), getTimeText.afternoon()];   
                                                          return [getTimeText.morning(), getTimeText.afternoon(), getTimeText.evening()];           // 밤 제외
                                                        } else if (categoryName === 'fruity') {
                                                          if (score >= 8) return [getTimeText.morning()];           
                                                          if (score >= 6) return [getTimeText.morning(), getTimeText.afternoon()];   
                                                          return [getTimeText.morning(), getTimeText.afternoon(), getTimeText.evening()];           
                                                        } else if (categoryName === 'woody') {
                                                          if (score >= 8) return [getTimeText.night()];             // 매우 깊음
                                                          if (score >= 6) return [getTimeText.evening(), getTimeText.night()];     
                                                          return [getTimeText.afternoon(), getTimeText.evening(), getTimeText.night()];             // 오전 제외
                                                        } else if (categoryName === 'musky') {
                                                          if (score >= 8) return [getTimeText.night()];             
                                                          if (score >= 6) return [getTimeText.evening(), getTimeText.night()];     
                                                          return [getTimeText.afternoon(), getTimeText.evening(), getTimeText.night()];             
                                                        } else if (categoryName === 'floral') {
                                                          if (score >= 8) return [getTimeText.afternoon()];           // 우아한 시간
                                                          if (score >= 6) return [getTimeText.morning(), getTimeText.afternoon()];   
                                                          return [getTimeText.morning(), getTimeText.afternoon(), getTimeText.evening()];           
                                                        } else { // spicy or unknown
                                                          if (score >= 8) return [getTimeText.evening()];           // 강렬한 시간
                                                          if (score >= 6) return [getTimeText.evening(), getTimeText.night()];     
                                                          return [getTimeText.morning(), getTimeText.evening(), getTimeText.night()];             // 오후 제외
                                                        }
                                                      })();
                                                      
                                                      const isRecommended = timeRecommendation.includes(time);
                                                      
                                                      return (
                                                        <div key={time} className="text-center">
                                                          <div className={`w-10 h-10 rounded-full ${isRecommended ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-400'} flex items-center justify-center mx-auto`}>
                                                            {idx === 0 && '🌅'}
                                                            {idx === 1 && '☀️'}
                                                            {idx === 2 && '🌆'}
                                                            {idx === 3 && '🌙'}
                                                          </div>
                                                          <p className={`text-[10px] mt-1 ${isRecommended ? 'font-bold text-blue-900' : 'text-gray-700'}`}>
                                                            {time}
                                                          </p>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      } catch (error) {
                                        console.error('매칭 이유 파싱 오류:', error);
                                        return (
                                          <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                            <p className="text-sm text-amber-800 italic">{match.matchReason}</p>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}
                                
                                {/* 향수 사용 가이드 */}
                                <div className="mb-4">
                                  <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
                                    <span className="mr-2">🧪</span>
                                    <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.usageGuide')}</span>
                                  </h3>
                                  
                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-pink-900 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-pink-700">
                                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                          <path d="M12 18h.01"></path>
                                        </svg>
                                        {t('result.perfume.howToUse')}
                                      </h4>
                                      {/* 항목들을 세로로 배열하고, 아이콘과 텍스트 크기를 다른 섹션과 유사하게 조정합니다. */}
                                      <div className="grid grid-cols-1 gap-2"> 
                                        {/* 아이템 1: 손목, 귀 뒤 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0"> {/* 아이콘 크기 w-10 h-10, 오른쪽 마진 mr-3 추가 */}
                                            <span className="text-pink-700 text-xl">🎯</span> {/* 아이콘 크기 text-xl */}
                                          </div>
                                          <div className="text-left"> {/* 텍스트 왼쪽 정렬 */}
                                            <p className="text-sm font-semibold text-pink-800">{t('result.perfume.hand')}</p> {/* 텍스트 크기 text-sm, font-semibold */}
                                            <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.pulseLocation')}</p> {/* 텍스트 크기 text-xs */}
                                          </div>
                                        </div>
                                        {/* 아이템 2: 옷에 뿌리기 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                                            <span className="text-pink-700 text-xl">👕</span>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-sm font-semibold text-pink-800">{t('result.perfume.wear')}</p>
                                            <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.distance')}</p>
                                          </div>
                                        </div>
                                        {/* 아이템 3: 공기 중 분사 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                                            <span className="text-pink-700 text-xl">💨</span>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-sm font-semibold text-pink-800">{t('result.perfume.spray')}</p>
                                            <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.aromaCloud')}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 향수 지속력 */}
                                    <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center">
                                        <span className="mr-1">⏱️</span>
                                        {t('result.perfume.lasting')}
                                      </h4>
                                      <div className="relative h-4 bg-gray-100 rounded-full mb-2">
                                        <div className="absolute left-0 top-0 h-full w-[85%] bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full"></div>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-gray-700">
                                        <span>{t('result.perfume.lastingDuration')}</span>
                                        <span>{t('result.perfume.lastingDescription')}</span>
                                        <span>{t('result.perfume.lastingPlus')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                          <span className="text-2xl">🔍</span>
                        </div>
                        <p className="text-gray-700 text-center">{t('result.perfume.noMatch')}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 버튼 영역 */}
              <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleFeedback}
                  className="px-4 py-2.5 bg-yellow-400 text-gray-900 rounded-full font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                >
                  {t('result.feedback')}
                </button>
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  {t('result.restart')}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
