"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageAnalysisResult, PerfumePersona, TraitScores, ScentCategoryScores } from '@/app/types/perfume';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TraitRadarChart from '@/components/chart/TraitRadarChart';
import ScentRadarChart from '@/components/chart/ScentRadarChart';
import KeywordCloud from '@/components/chart/KeywordCloud';

/**
 * 향수의 특성에 맞는 계절 추천을 반환합니다
 */
function getSeasonRecommendation(persona?: PerfumePersona): string {
  if (!persona || !persona.categories) return '사계절';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return '봄, 여름';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.spicy > 6) {
    return '가을, 겨울';
  } else {
    return '사계절';
  }
}

/**
 * 향수의 특성에 맞는 시간대 추천을 반환합니다
 */
function getTimeRecommendation(persona?: PerfumePersona): string {
  if (!persona || !persona.categories) return '언제든지';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6 || persona.categories.fruity > 6) {
    return '오전, 오후';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6 || persona.categories.musky > 6) {
    return '저녁, 밤';
  } else {
    return '언제든지';
  }
}

/**
 * 향수의 특성에 맞는 상황 추천을 반환합니다
 */
function getOccasionRecommendation(persona?: PerfumePersona): string {
  if (!persona || !persona.categories) return '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  
  // @ts-ignore - categories 프로퍼티 접근 허용
  if (persona.categories.citrus > 6) {
    return '활기찬 바캉스, 활동적인 데이트, 산뜻한 오피스 룩';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.woody > 6) {
    return '중요한 비즈니스 미팅, 고급 레스토랑 디너, 특별한 이브닝 모임';
  // @ts-ignore - categories 프로퍼티 접근 허용
  } else if (persona.categories.floral > 6) {
    return '로맨틱한 데이트, 웨딩 게스트, 우아한 갈라 디너';
  } else {
    return '특별한 모임, 중요한 자리, 일상적인 향기 표현';
  }
}

export default function ResultPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'perfume'>('analysis');
  const [isLoaded, setIsLoaded] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [twitterName, setTwitterName] = useState<string>('');

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
              throw new Error('분석 결과에 특성(traits) 정보가 없습니다. 다시 시도해주세요.');
            }
            
            // 분석 결과 저장
            setAnalysisResult(parsedResult);
            
            // 트위터스타일 이름 생성
            generateTwitterName(parsedResult);
            
            setLoading(false);
            setTimeout(() => setIsLoaded(true), 100); // 로딩 후 애니메이션을 위한 약간의 지연
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            setError(parseError instanceof Error ? parseError.message : '분석 결과 형식이 올바르지 않습니다. 다시 시도해주세요.');
            setLoading(false);
          }
        } else {
          setError('분석 결과를 찾을 수 없습니다. 다시 시도해주세요.');
          setLoading(false);
        }
      } catch (err) {
        console.error('결과 페이지 로딩 오류:', err);
        setError('결과를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchResult();
  }, []);
  
  // 트위터스타일 이름 생성 함수
  const generateTwitterName = (analysisResult: ImageAnalysisResult) => {
    if (!analysisResult || !analysisResult.traits || !analysisResult.matchingKeywords) return;
    
    // 상위 3개 특성 추출
    const sortedTraits = Object.entries(analysisResult.traits)
      .sort(([, valueA], [, valueB]) => valueB - valueA)
      .slice(0, 3)
      .map(([key]) => key);
      
    // 특성명을 한글로 변환
    const traitNames: Record<string, string> = {
      sexy: '섹시함',
      cute: '귀여움',
      charisma: '카리스마',
      darkness: '다크함',
      freshness: '청량함',
      elegance: '우아함',
      freedom: '자유로움',
      luxury: '럭셔리함',
      purity: '순수함',
      uniqueness: '독특함'
    };
    
    // 매칭 키워드에서 랜덤하게 2개 선택
    const randomKeywords = [...analysisResult.matchingKeywords]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    // 캐릭터 설명 스타일의 패턴
    const patterns = [
      `${randomKeywords[0]} 파 두목. 피도 눈물도 없다.`,
      `국제 ${traitNames[sortedTraits[0]]} 연맹 회장. 단호박 끝판왕.`,
      `${randomKeywords[0]} 계의 신. 눈빛만으로 제압 가능.`,
      `인간 ${randomKeywords[0]}. 저세상 ${traitNames[sortedTraits[0]]}.`,
      `${traitNames[sortedTraits[0]]} 마스터. 당신의 심장을 훔칠 예정.`,
      `${randomKeywords[0]} ${randomKeywords[1]} 대마왕. 근접 금지구역.`,
      `전설의 ${randomKeywords[0]} 사냥꾼. 오늘의 타겟은 바로 당신.`
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
  const characterImagePath = '/cute.png';
  const sadCharacterImagePath = '/sad.png';

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
            <p className="text-gray-800 text-sm">내 최애의 향은 어떨까? 궁금궁금 스멜~</p>
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
              <p className="text-center text-gray-700">분석 결과를 로딩 중입니다...</p>
            </div>
            
            {/* 오른쪽 하단 캐릭터 */}
            <div className="absolute -right-4 bottom-0 w-24 h-24">
              <Image 
                src={characterImagePath}
                alt="Cute Character"
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
                다시 시작하기
              </button>
            </div>
            
            {/* 오른쪽 하단 캐릭터 - 슬픈 표정 */}
            <div className="absolute -right-4 bottom-0 w-24 h-24">
              <Image 
                src={sadCharacterImagePath}
                alt="Sad Character"
                width={100}
                height={100}
                className="object-contain"
                priority
              />
            </div>
          </div>
        ) : analysisResult ? (
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
                    alt="분석된 이미지" 
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
                    alt="Cute Character"
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
                  이미지 분석
                </button>
                <button 
                  className={`flex-1 px-3 py-2 text-sm ${activeTab === 'perfume' ? 'border-b-2 border-yellow-400 text-gray-900 font-medium' : 'text-gray-700'}`}
                  onClick={() => setActiveTab('perfume')}
                >
                  향수 추천
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
                    {analysisResult.analysis && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">이미지 분위기</span>
                          <span className="ml-2 text-xs text-yellow-700">AI의 생각</span>
                        </h3>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-inner">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white">
                                <span className="text-xl">💭</span>
                              </div>
                            </div>
                            <p className="text-gray-900 text-sm font-medium italic">"{analysisResult.analysis.mood}"</p>
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
                        <span className="bg-yellow-100 px-2 py-0.5 rounded">이미지 특성 점수</span>
                        <span className="ml-2 text-xs text-pink-700">향수 매칭의 핵심</span>
                      </h3>
                      
                      <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm mb-4">
                        {/* 레이더 차트 부분 - 여백 적절히 조정 */}
                        {analysisResult.traits && (
                          <div className="flex justify-center">
                            <div className="w-full min-h-[380px] h-auto relative mb-6">
                              <TraitRadarChart traits={analysisResult.traits} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 스타일 분석 - API 응답 사용하면서 간결하게 표현 */}
                    {analysisResult.analysis && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">스타일 분석</span>
                          <span className="ml-2 text-xs text-green-700">패션 스타일 해석</span>
                        </h3>
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="grid grid-cols-1 gap-3">
                            {analysisResult.analysis.style && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-pink-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-pink-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-600">
                                      <circle cx="12" cy="7" r="4"></circle>
                                      <path d="M5 21V19a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-pink-800 mb-1">패션 스타일</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      세계적인 디자이너급 "{analysisResult.analysis.style}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {analysisResult.analysis.expression && (
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
                                    <h4 className="text-xs font-bold text-purple-800 mb-1">표현과 연출</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      케이트 모스도 울고 갈 "{analysisResult.analysis.expression}"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {analysisResult.analysis.concept && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-indigo-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-600">
                                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-18c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zM3 12c0 1.65 1.35 3 3 3s3-1.35 3-3-1.35-3-3-3-3 1.35-3 3z"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-indigo-800 mb-1">스타일 콘셉트</h4>
                                    <p className="text-gray-800 text-sm italic">
                                      패션위크 런웨이급 "{analysisResult.analysis.concept}"
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
                    {analysisResult.analysis && (analysisResult.analysis.aura || analysisResult.analysis.toneAndManner) && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">아우라 & 톤앤매너</span>
                          <span className="ml-2 text-xs text-blue-700">분위기의 핵심</span>
                        </h3>
                        <div className="bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-inner">
                          <div className="grid grid-cols-1 gap-4">
                            {analysisResult.analysis.aura && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">✨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-purple-800">아우라</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-800 text-sm italic">"{analysisResult.analysis.aura}"</p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResult.analysis.toneAndManner && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">🎨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-blue-800">톤앤매너</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-800 text-sm italic">"{analysisResult.analysis.toneAndManner}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 매칭 키워드 */}
                    {analysisResult.matchingKeywords && analysisResult.matchingKeywords.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">매칭 키워드</span>
                          <span className="ml-2 text-xs text-orange-700">특성을 나타내는 단어들</span>
                        </h3>
                        <div className="bg-white rounded-xl py-3 px-4 border border-orange-200 min-h-[150px] max-h-[180px] overflow-auto">
                          <KeywordCloud keywords={analysisResult.matchingKeywords} />
                        </div>
                      </div>
                    )}
                    
                    {/* 컬러 타입 */}
                    {analysisResult.personalColor && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">컬러 타입</span>
                          <span className="ml-2 text-xs text-teal-700">이미지 컬러 분석</span>
                        </h3>
                        <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100 shadow-sm">
                          <div className="flex items-start mb-3">
                            <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center"
                              style={{ 
                                background: `linear-gradient(135deg, ${
                                  analysisResult.personalColor.palette?.[0] || '#fff'
                                }, ${
                                  analysisResult.personalColor.palette?.[1] || '#f9f9f9'
                                })`
                              }}
                            ></div>
                            <div>
                              <p className="text-gray-900 text-sm font-bold">
                            {analysisResult.personalColor.season} {analysisResult.personalColor.tone} 타입
                          </p>
                              <p className="text-gray-700 text-sm mt-1 italic">
                                "{analysisResult.personalColor.description}"
                              </p>
                              <p className="text-pink-700 text-xs mt-2 font-medium">
                                + 어머! 이 컬러 조합은 정말 당신 최애를 위해 태어난 거예요! 
                                이런 퍼스널 컬러는 타고나는 건데... 색감이 영혼까지 표현해주네요! 
                                이 컬러 팔레트로 메이크업해도 진짜 찰떡일 것 같아요! 💄✨
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {analysisResult.personalColor.palette && analysisResult.personalColor.palette.map((color, index) => (
                              <div 
                                key={index}
                                className="w-8 h-8 rounded-full border shadow-sm transform hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-white rounded-lg border border-pink-100">
                            <h5 className="text-xs font-bold text-pink-700 mb-2">컬러 매칭 코디 추천</h5>
                            <p className="text-gray-800 text-xs">
                              ✨ 이 톤은 {analysisResult.personalColor.season === 'winter' ? '차가운 블루 베이스' : 
                                       analysisResult.personalColor.season === 'summer' ? '부드러운 쿨톤' : 
                                       analysisResult.personalColor.season === 'autumn' ? '깊이 있는 웜톤' : '밝고 화사한 웜톤'}의 대표 주자! 
                              {analysisResult.personalColor.tone} 특성을 살린 
                              {analysisResult.personalColor.season === 'winter' ? ' 실버 주얼리와 블랙&화이트 아이템' : 
                               analysisResult.personalColor.season === 'summer' ? ' 라벤더, 로즈, 소프트한 파스텔 컬러' : 
                               analysisResult.personalColor.season === 'autumn' ? ' 카멜, 올리브, 버건디 컬러' : ' 피치, 코랄, 밝은 옐로우 컬러'}로 
                              스타일링하면 아우라가 두 배!
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
                    {analysisResult.matchingPerfumes && analysisResult.matchingPerfumes.length > 0 ? (
                      <>
                        {/* 매칭된 향수 정보 */}
                        {analysisResult.matchingPerfumes.map((match, index) => (
                          <div key={index} className="mb-6">
                            <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
                              {/* 향수 정보 헤더 - 향수 코드 강조 */}
                              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 border-b border-yellow-200">
                                <div className="flex justify-between items-start">
                                  {/* 향수 코드 + 이름 섹션 */}
                                  <div className="flex flex-col">
                                    {/* 향수 코드 (강조) */}
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-700 mb-1 border-b-2 border-amber-300 inline-block pb-1">
                                      {match.persona?.id || '맞춤 향수'}
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
                                    <span className="bg-amber-100 px-2 py-0.5 rounded">향 노트 피라미드</span>
                                  </h3>
                                  
                                  <div className="relative pt-6">
                                    {/* Top Note */}
                                    <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 p-3 rounded-t-lg border border-yellow-200 mb-1 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-yellow-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-yellow-700 font-bold text-xs">TOP</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-yellow-900">{match.persona?.mainScent?.name || 'Top Note'}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            첫 15-20분간 지속되는 첫인상의 향
                                          </p>
                                          <p className="text-xs italic text-amber-800 mt-1">
                                            "향의 첫인상을 결정하는 탑 노트! 향수를 뿌린 직후 느껴지는 첫 번째 향기로 매력적인 시작을 선사합니다."
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Middle Note */}
                                    <div className="bg-gradient-to-b from-amber-100 to-amber-50 p-3 border border-amber-200 mb-1 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-amber-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-amber-700 font-bold text-xs">MID</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-amber-900">{match.persona?.subScent1?.name || 'Middle Note'}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            3-4시간 지속되는 향수의 심장부
                                          </p>
                                          <p className="text-xs italic text-amber-800 mt-1">
                                            "향의 진정한 성격을 보여주는 미들 노트! 탑 노트가 사라진 후 나타나 향수의 주요 개성과 특징을 드러냅니다."
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Base Note */}
                                    <div className="bg-gradient-to-b from-orange-100 to-orange-50 p-3 rounded-b-lg border border-orange-200 hover:shadow-md transition-shadow">
                                      <div className="flex items-start">
                                        <div className="bg-orange-200 rounded-full p-2 mr-3 flex-shrink-0">
                                          <span className="text-orange-700 font-bold text-xs">BASE</span>
                                        </div>
                                        <div>
                                          {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                                          <h4 className="text-sm font-bold text-orange-900">{match.persona?.subScent2?.name || 'Base Note'}</h4>
                                          <p className="text-xs text-gray-700 mt-1">
                                            5-6시간 이상 지속되는 잔향
                                          </p>
                                          <p className="text-xs italic text-amber-800 mt-1">
                                            "향의 기억을 담당하는 베이스 노트! 가장 오래 지속되며 향수의 깊이와 따뜻함을 완성하는 마지막 퍼즐입니다."
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 향 발현 타임라인 */}
                                    <div className="mt-4 pt-2 border-t border-amber-100">
                                      <h5 className="text-xs font-medium text-gray-800 mb-2">향 발현 타임라인</h5>
                                      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="absolute left-0 top-0 h-full w-1/6 bg-yellow-300 rounded-l-full flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-yellow-900">TOP</span>
                                        </div>
                                        <div className="absolute left-1/6 top-0 h-full w-3/6 bg-amber-400 flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-amber-900">MIDDLE</span>
                                        </div>
                                        <div className="absolute right-0 top-0 h-full w-2/6 bg-orange-300 rounded-r-full flex items-center justify-center">
                                          <span className="text-[8px] font-bold text-orange-900">BASE</span>
                                        </div>
                                      </div>
                                      <div className="flex justify-between mt-1 text-[8px] text-gray-700">
                                        <span>15-20분</span>
                                        <span>3-4시간</span>
                                        <span>5-6시간+</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 향수 특성 시각화 */}
                                {match.persona?.categories && (
                                  <div className="mb-6 pt-2">
                                    <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
                                      <span className="mr-2">⚗️</span>
                                      <span className="bg-amber-100 px-2 py-0.5 rounded">향수 특성 프로필</span>
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
                                            citrus: '시트러스',
                                            floral: '플로럴',
                                            woody: '우디',
                                            musky: '머스크',
                                            fruity: '프루티',
                                            spicy: '스파이시'
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
                                          <span className="font-bold">주요 계열:</span> {(() => {
                                            const mainCategory = Object.entries(match.persona?.categories || {})
                                              .sort(([, a], [, b]) => (b as number) - (a as number))[0];
                                            
                                            const categoryNames: Record<string, string> = {
                                              citrus: '시트러스',
                                              floral: '플로럴',
                                              woody: '우디',
                                              musky: '머스크',
                                              fruity: '프루티',
                                              spicy: '스파이시'
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
                                      <span className="bg-amber-100 px-2 py-0.5 rounded">향수 매칭 스토리</span>
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
                                                  <h4 className="text-sm font-bold text-amber-900 mb-1">향수 전문가의 평가</h4>
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
                                                이미지와 향수의 매칭 이유
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
                                                  향수 사용 추천
                                                </h4>
                                                <p className="text-sm text-amber-800">{usageRecommendation}</p>
                                              </div>
                                              
                                              {/* 계절 및 시간 추천 - 시각화 */}
                                              <div className="grid grid-cols-1 gap-3 mt-2">
                                                {/* 계절 추천 */}
                                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                                                  <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center">
                                                    <span className="mr-1">🌿</span>
                                                    추천 계절
                                                  </h5>
                                                  <div className="flex justify-between">
                                                    {['봄', '여름', '가을', '겨울'].map((season, idx) => {
                                                      const seasonRecommendation = (() => {
                                                        const categoryEntries = Object.entries(match.persona?.categories || {})
                                                          .sort(([, a], [, b]) => (b as number) - (a as number));
                                                        
                                                        if (categoryEntries.length === 0) return ['봄', '여름'];
                                                        
                                                        const [categoryName, score] = categoryEntries[0];
                                                        
                                                        if (categoryName === 'citrus') {
                                                          if (score >= 8) return ['여름'];           // 매우 강함: 1개
                                                          if (score >= 6) return ['봄', '여름'];     // 강함: 2개
                                                          return ['봄', '여름', '가을'];             // 보통: 3개 (겨울 제외)
                                                        } else if (categoryName === 'fruity') {
                                                          if (score >= 8) return ['여름'];           
                                                          if (score >= 6) return ['봄', '여름'];     
                                                          return ['봄', '여름', '가을'];             
                                                        } else if (categoryName === 'woody') {
                                                          if (score >= 8) return ['겨울'];           
                                                          if (score >= 6) return ['가을', '겨울'];   
                                                          return ['여름', '가을', '겨울'];           // 봄 제외
                                                        } else if (categoryName === 'spicy') {
                                                          if (score >= 8) return ['겨울'];           
                                                          if (score >= 6) return ['가을', '겨울'];   
                                                          return ['여름', '가을', '겨울'];           
                                                        } else if (categoryName === 'floral') {
                                                          if (score >= 8) return ['봄'];             
                                                          if (score >= 6) return ['봄', '여름'];     
                                                          return ['봄', '여름', '가을'];             
                                                        } else { // musky or unknown
                                                          if (score >= 8) return ['겨울'];           
                                                          if (score >= 6) return ['가을', '겨울'];   
                                                          return ['봄', '가을', '겨울'];             // 여름 제외
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
                                                    추천 시간대
                                                  </h5>
                                                  <div className="flex justify-between">
                                                    {['오전', '오후', '저녁', '밤'].map((time, idx) => {
                                                      const timeRecommendation = (() => {
                                                        const categoryEntries = Object.entries(match.persona?.categories || {})
                                                          .sort(([, a], [, b]) => (b as number) - (a as number));
                                                        
                                                        if (categoryEntries.length === 0) return ['오전', '오후'];
                                                        
                                                        const [categoryName, score] = categoryEntries[0];
                                                        
                                                        if (categoryName === 'citrus') {
                                                          if (score >= 8) return ['오전'];           // 매우 상쾌함
                                                          if (score >= 6) return ['오전', '오후'];   
                                                          return ['오전', '오후', '저녁'];           // 밤 제외
                                                        } else if (categoryName === 'fruity') {
                                                          if (score >= 8) return ['오전'];           
                                                          if (score >= 6) return ['오전', '오후'];   
                                                          return ['오전', '오후', '저녁'];           
                                                        } else if (categoryName === 'woody') {
                                                          if (score >= 8) return ['밤'];             // 매우 깊음
                                                          if (score >= 6) return ['저녁', '밤'];     
                                                          return ['오후', '저녁', '밤'];             // 오전 제외
                                                        } else if (categoryName === 'musky') {
                                                          if (score >= 8) return ['밤'];             
                                                          if (score >= 6) return ['저녁', '밤'];     
                                                          return ['오후', '저녁', '밤'];             
                                                        } else if (categoryName === 'floral') {
                                                          if (score >= 8) return ['오후'];           // 우아한 시간
                                                          if (score >= 6) return ['오전', '오후'];   
                                                          return ['오전', '오후', '저녁'];           
                                                        } else { // spicy or unknown
                                                          if (score >= 8) return ['저녁'];           // 강렬한 시간
                                                          if (score >= 6) return ['저녁', '밤'];     
                                                          return ['오전', '저녁', '밤'];             // 오후 제외
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
                                    <span className="bg-amber-100 px-2 py-0.5 rounded">이렇게 사용해보세요!</span>
                                  </h3>
                                  
                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-pink-900 mb-2 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-pink-700">
                                          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                          <path d="M12 18h.01"></path>
                                        </svg>
                                        어떻게 사용할까요?
                                      </h4>
                                      {/* 항목들을 세로로 배열하고, 아이콘과 텍스트 크기를 다른 섹션과 유사하게 조정합니다. */}
                                      <div className="grid grid-cols-1 gap-2"> 
                                        {/* 아이템 1: 손목, 귀 뒤 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0"> {/* 아이콘 크기 w-10 h-10, 오른쪽 마진 mr-3 추가 */}
                                            <span className="text-pink-700 text-xl">🎯</span> {/* 아이콘 크기 text-xl */}
                                          </div>
                                          <div className="text-left"> {/* 텍스트 왼쪽 정렬 */}
                                            <p className="text-sm font-semibold text-pink-800">손목, 귀 뒤</p> {/* 텍스트 크기 text-sm, font-semibold */}
                                            <p className="text-xs text-gray-700 whitespace-nowrap">맥박이 뛰는 곳</p> {/* 텍스트 크기 text-xs */}
                                          </div>
                                        </div>
                                        {/* 아이템 2: 옷에 뿌리기 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                                            <span className="text-pink-700 text-xl">👕</span>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-sm font-semibold text-pink-800">옷에 뿌리기</p>
                                            <p className="text-xs text-gray-700 whitespace-nowrap">15cm 거리에서</p>
                                          </div>
                                        </div>
                                        {/* 아이템 3: 공기 중 분사 */}
                                        <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
                                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                                            <span className="text-pink-700 text-xl">💨</span>
                                          </div>
                                          <div className="text-left">
                                            <p className="text-sm font-semibold text-pink-800">공기 중 분사</p>
                                            <p className="text-xs text-gray-700 whitespace-nowrap">향기 구름 속으로</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* 향수 지속력 */}
                                    <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center">
                                        <span className="mr-1">⏱️</span>
                                        향수 지속력
                                      </h4>
                                      <div className="relative h-4 bg-gray-100 rounded-full mb-2">
                                        <div className="absolute left-0 top-0 h-full w-[85%] bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full"></div>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-gray-700">
                                        <span>4-5시간</span>
                                        <span>지속 시간</span>
                                        <span>8시간+</span>
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
                        <p className="text-gray-700 text-center">매칭된 향수가 없습니다. 다시 시도해주세요.</p>
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
                  피드백 남기기
                </button>
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  다시 시작하기
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
