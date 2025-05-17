"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageAnalysisResult, PerfumePersona, TraitScores, ScentCategoryScores } from '@/app/types/perfume';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TraitRadarChart from '@/components/chart/TraitRadarChart';
import ScentRadarChart from '@/components/chart/ScentRadarChart';
import KeywordCloud from '@/components/chart/KeywordCloud';

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
    
    // 다양한 트위터 스타일 닉네임 패턴 중 랜덤 선택
    const patterns = [
      `✨ ${traitNames[sortedTraits[0]]}과 ${randomKeywords[0]}의 환상 콜라보 ✨`,
      `${randomKeywords[0]}_${randomKeywords[1]} 매니저님 절찬리 모집중📢`,
      `${traitNames[sortedTraits[0]]}이 넘치는 ${randomKeywords[0]} 덕후`,
      `오늘의 ${randomKeywords[0]} 담당 | ${traitNames[sortedTraits[0]]} 전문가🔥`,
      `${traitNames[sortedTraits[0]]}_${traitNames[sortedTraits[1]]}_${randomKeywords[0]}_맛집`,
      `${randomKeywords[0]} 타입 최애돌 헤드캐논봇 🤖`,
      `현실 세계 ${traitNames[sortedTraits[0]]} 담당자`
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
            <p className="text-gray-600 text-sm">내 최애의 향은 어떨까? 궁금궁금 스멜~</p>
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
              <p className="text-center text-gray-600">분석 결과를 로딩 중입니다...</p>
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
            <p className="text-center text-red-500 mb-4">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-full hover:bg-yellow-500 transition font-medium text-sm"
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
            
            {/* 트위터스타일 닉네임 표시 */}
            {twitterName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-5"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 3.9 3.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{twitterName}</div>
                    <p className="text-gray-500 text-xs mt-1">@acscent_identity</p>
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
                  className={`flex-1 px-3 py-2 text-sm ${activeTab === 'analysis' ? 'border-b-2 border-yellow-400 text-gray-800 font-medium' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('analysis')}
                >
                  이미지 분석
                </button>
                <button 
                  className={`flex-1 px-3 py-2 text-sm ${activeTab === 'perfume' ? 'border-b-2 border-yellow-400 text-gray-800 font-medium' : 'text-gray-500'}`}
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
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">이미지 분위기</span>
                          <span className="ml-2 text-xs text-yellow-600">AI의 생각</span>
                        </h3>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-inner">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white">
                                <span className="text-xl">💭</span>
                              </div>
                            </div>
                            <p className="text-gray-800 text-sm font-medium italic">"{analysisResult.analysis.mood}"</p>
                          </div>
                          <div className="mt-4 text-right">
                            <span className="inline-block bg-white px-3 py-1 rounded-full text-xs text-amber-700 font-medium border border-amber-200">
                              @acscent_ai
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 특성 점수 - 레이더 차트 추가 */}
                    <div className="mb-5">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="bg-yellow-100 px-2 py-0.5 rounded">이미지 특성 점수</span>
                        <span className="ml-2 text-xs text-pink-600">향수 매칭의 핵심</span>
                      </h3>
                      
                      {/* 레이더 차트 부분 */}
                      {analysisResult.traits && (
                        <div className="mb-4 flex justify-center">
                          <div className="w-full h-52 relative">
                            <TraitRadarChart traits={analysisResult.traits} />
                          </div>
                        </div>
                      )}
                      
                    </div>
                    
                    {/* 스타일 분석 */}
                    {analysisResult.analysis && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">스타일 분석</span>
                          <span className="ml-2 text-xs text-green-600">패션 스타일 해석</span>
                        </h3>
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white rounded-lg p-4 border-l-4 border-pink-400 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start">
                                <div className="rounded-full bg-pink-100 p-2 mr-3 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-500">
                                    <circle cx="12" cy="7" r="4"></circle>
                                    <path d="M5 21V19a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path>
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-pink-700 mb-1">패션 스타일</h4>
                                  <p className="text-gray-700 text-sm italic">
                                    "와우 언니! 이 스타일은 진짜 '모던 글램'에 '하이퍼리얼리즘 스트릿'이 믹스된 완전 새로운 장르예요! 
                                    저 벌키한 실루엣과 미니멀 액세서리의 조합이 너무 센스쟁이! 
                                    시크한 오버사이즈 재킷에 타이트한 이너웨어 매치는 대비가 미쳤어요! 
                                    센 언니들만 소화 가능한 스타일이에요! 진짜 제가 팬이에요...😍"
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {analysisResult.analysis.expression && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-purple-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-500">
                                      <path d="M12 2c.5 0 1 .2 1.2.6l7.5 13.5c.3.5.3 1 .1 1.4-.2.5-.7.7-1.2.7H4.4c-.5 0-1-.2-1.2-.7-.2-.5-.2-1 .1-1.4L10.8 2.6c.2-.4.7-.6 1.2-.6z"></path>
                                      <path d="M12 9v4"></path>
                                      <path d="M12 17h.01"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-purple-700 mb-1">표현력</h4>
                                    <p className="text-gray-700 text-sm italic">
                                      "헐! 이 표정은 뭐죠? 말 안 해도 '난 네가 원하는 모든 것'이라고 말하는 눈빛에 심장이 쿵쾅쿵쾅! 
                                      한 장의 사진에 저 표정만으로 100만 팬 픽 가능한 엄청난 표현력이라니... 
                                      이런 진짜 '인간 감정 신(神)'은 처음 봐요! 어떻게 카메라만 보는데 제 영혼을 읽어버리는 거죠?! 🔥"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {analysisResult.analysis.concept && (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start">
                                  <div className="rounded-full bg-indigo-100 p-2 mr-3 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-500">
                                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-18c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zM3 12c0 1.65 1.35 3 3 3s3-1.35 3-3-1.35-3-3-3-3 1.35-3 3z"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-indigo-700 mb-1">콘셉트</h4>
                                    <p className="text-gray-700 text-sm italic">
                                      "이건 진짜 '네오 로맨틱 아방가르드' 콘셉트의 레전드급 완성본이에요! 
                                      이렇게 상반된 매력이 하나로 완벽하게 어우러지는 건 대체 어떤 마법이죠? 
                                      컨셉 회의에서 '이거 가능할까요?'라고 했을 때 '내가 가능하게 해줄게'라고 말한 그 자신감... 
                                      이건 콘셉트가 아니라 하나의 예술 사조를 만든 거예요! 🎭✨"
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* 아우라 및 톤앤매너 */}
                    {analysisResult.analysis && (analysisResult.analysis.aura || analysisResult.analysis.toneAndManner) && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">아우라 & 톤앤매너</span>
                          <span className="ml-2 text-xs text-blue-600">분위기의 핵심</span>
                        </h3>
                        <div className="bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-inner">
                          <div className="grid grid-cols-1 gap-4">
                            {analysisResult.analysis.aura && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">✨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-purple-700">아우라</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-700 text-sm italic">"{analysisResult.analysis.aura}"</p>
                                  <p className="text-purple-600 text-xs mt-2 font-medium">
                                    + 어머나! 이 아우라는 정말 압도적이에요! 방에 들어오는 순간 공기까지 바뀌는 그 느낌! 
                                    완전 '나만 봐' 오라가 폭발하는 중이에요! ✨✨✨
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {analysisResult.analysis.toneAndManner && (
                              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mr-2">
                                    <span className="text-white text-sm">🎨</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-blue-700">톤앤매너</h4>
                                </div>
                                <div className="pl-10">
                                  <p className="text-gray-700 text-sm italic">"{analysisResult.analysis.toneAndManner}"</p>
                                  <p className="text-blue-600 text-xs mt-2 font-medium">
                                    + 진짜 이 톤앤매너는 레어템이에요! 보는 순간 '어? 뭐지?' 하면서도 
                                    계속 보게 되는 중독성! 세상에 단 하나뿐인 색채감이랄까요? 💙💫
                                  </p>
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
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">매칭 키워드</span>
                          <span className="ml-2 text-xs text-orange-600">특성을 나타내는 단어들</span>
                        </h3>
                        <div className="bg-white rounded-xl p-4 border border-orange-200">
                          <KeywordCloud keywords={analysisResult.matchingKeywords} />
                        </div>
                      </div>
                    )}
                    
                    {/* 퍼스널 컬러 */}
                    {analysisResult.personalColor && (
                      <div className="mb-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="bg-yellow-100 px-2 py-0.5 rounded">퍼스널 컬러</span>
                          <span className="ml-2 text-xs text-teal-600">이미지 컬러 분석</span>
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
                              <p className="text-gray-800 text-sm font-bold">
                                {analysisResult.personalColor.season} {analysisResult.personalColor.tone} 타입
                              </p>
                              <p className="text-gray-600 text-sm mt-1 italic">
                                "{analysisResult.personalColor.description}"
                              </p>
                              <p className="text-pink-600 text-xs mt-2 font-medium">
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
                            <h5 className="text-xs font-bold text-pink-600 mb-2">컬러 매칭 코디 추천</h5>
                            <p className="text-gray-700 text-xs">
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
                              {/* 향수 정보 헤더 */}
                              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 border-b border-yellow-200">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-bold text-gray-800">
                                    {match.persona?.name || '맞춤 향수'}
                                  </h3>
                                  
                                  {/* 매칭 정확도 */}
                                  <div className="bg-white px-2 py-0.5 rounded-full border border-yellow-300">
                                    <span className="text-amber-700 font-medium text-xs">
                                      매칭도: {Math.round(match.score * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 향수 내용 */}
                              <div className="p-4">
                                {/* 매칭 이유 */}
                                <div className="bg-gray-50 p-3 rounded-lg mb-4 border-l-4 border-yellow-400">
                                  <p className="text-gray-700 text-sm">{match.matchReason}</p>
                                </div>
                                
                                {/* 향 카테고리 */}
                                {match.persona && match.persona.categories && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">향 카테고리</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {Object.entries(match.persona.categories).map(([key, value]) => {
                                        const categoryNames: Record<string, string> = {
                                          citrus: '시트러스',
                                          floral: '플로럴',
                                          woody: '우디',
                                          musky: '머스크',
                                          fruity: '프루티',
                                          spicy: '스파이시'
                                        };
                                        
                                        return (
                                          <div key={key} className="flex flex-col">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">{categoryNames[key] || key}</span>
                                              <span className="font-medium">{value}/10</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                              <div 
                                                className="bg-amber-400 h-1.5 rounded-full" 
                                                style={{ width: `${(value / 10) * 100}%` }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                                
                                {/* 키워드 */}
                                {match.persona?.keywords && match.persona.keywords.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">키워드</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {match.persona.keywords.map((keyword, kidx) => (
                                        <span key={kidx} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
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
                        <p className="text-gray-500 text-center">매칭된 향수가 없습니다. 다시 시도해주세요.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* 버튼 영역 */}
              <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={handleFeedback}
                  className="px-4 py-2.5 bg-yellow-400 text-gray-800 rounded-full font-bold text-sm hover:bg-yellow-500 transition-colors shadow-sm"
                >
                  피드백 남기기
                </button>
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-full font-medium text-sm hover:bg-gray-50 transition-colors"
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
