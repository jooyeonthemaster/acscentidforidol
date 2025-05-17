"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfumePersona } from '@/app/types/perfume';
import { motion } from 'framer-motion';

// 피드백 데이터 인터페이스
interface PerfumeFeedback {
  perfumeId: string;
  retentionPercentage: number; // 향 유지 비율 (0%, 20%, 40%, 60%, 80%, 100%)
  intensity: number;           // 향의 강도 (1-5)
  sweetness: number;           // 단맛 (1-5)
  bitterness: number;          // 쓴맛 (1-5)
  sourness: number;            // 시큼함 (1-5)
  freshness: number;           // 신선함 (1-5)
  notes: string;               // 추가 코멘트
}

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfume, setPerfume] = useState<PerfumePersona | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedback, setFeedback] = useState<PerfumeFeedback>({
    perfumeId: '',
    retentionPercentage: 100,
    intensity: 3,
    sweetness: 3,
    bitterness: 3,
    sourness: 3,
    freshness: 3,
    notes: '',
  });

  useEffect(() => {
    try {
      // 로컬 스토리지에서 분석 결과 불러오기
      const storedResult = localStorage.getItem('analysisResult');
      
      if (!storedResult) {
        setError('분석 결과를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 분석 결과 파싱하여 향수 정보 가져오기
      const parsedResult = JSON.parse(storedResult);
      const topMatch = parsedResult.matchingPerfumes?.find((p: any) => p.persona);
      
      if (!topMatch || !topMatch.persona) {
        setError('추천된 향수 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      setPerfume(topMatch.persona);
      setFeedback(prev => ({ ...prev, perfumeId: topMatch.persona.id }));
      setLoading(false);
      setIsLoaded(true);
    } catch (err) {
      console.error('결과 로딩 오류:', err);
      setError('향수 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, []);

  // 슬라이더 변경 핸들러
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: parseInt(value) }));
  };
  
  // 라디오 버튼 변경 핸들러
  const handleRadioChange = (value: number) => {
    setFeedback(prev => ({ ...prev, retentionPercentage: value }));
  };
  
  // 텍스트 영역 변경 핸들러
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(prev => ({ ...prev, notes: e.target.value }));
  };
  
  // 피드백 제출 핸들러
  const handleSubmit = async () => {
    try {
      // 로컬 스토리지에 피드백 저장
      localStorage.setItem('perfumeFeedback', JSON.stringify(feedback));
      
      // API 호출 준비
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
      
      if (!response.ok) {
        throw new Error('피드백 저장에 실패했습니다.');
      }
      
      // 향수 조정 페이지로 이동
      router.push('/adjustment');
    } catch (error) {
      console.error('피드백 제출 오류:', error);
      alert('피드백을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 결과 페이지로 돌아가기
  const handleBack = () => {
    router.push('/result');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-bounce bg-yellow-400 rounded-full h-4 w-4 mr-1"></div>
          <div className="animate-bounce bg-yellow-300 rounded-full h-4 w-4 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-yellow-200 rounded-full h-4 w-4" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-yellow-800 font-medium">향수 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !perfume) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">오류 발생</h2>
          <p className="text-gray-700 mb-6">{error || '향수 정보를 불러올 수 없습니다. 다시 시도해주세요.'}</p>
          <button
            onClick={() => router.push('/result')}
            className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.6 }}
        className="w-[380px] relative bg-white rounded-3xl border-4 border-dashed border-gray-300 p-6 shadow-lg"
        style={{ maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* 왼쪽 위 점 장식 */}
        <div className="absolute -left-3 top-20 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 오른쪽 아래 캐릭터 */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
          className="absolute -right-4 bottom-32 w-24 h-24"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/cute.png" 
              alt="Cute Character" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                transform: 'scaleX(-1)'
              }}
            />
          </div>
        </motion.div>
        
        {/* 왼쪽 하단 장식 */}
        <div className="absolute -left-3 bottom-28 w-6 h-6 bg-amber-50 border-4 border-amber-400 rounded-full"></div>
        
        {/* 헤더 영역 */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            <span className="bg-yellow-300 px-2 py-1">향수 피드백</span>
          </h1>
          <p className="text-gray-600 text-sm">
            추천된 향수에 대한 피드백을 입력해주세요.
          </p>
        </div>

        {/* 향수 정보 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold mr-3 text-sm">
              {perfume.id.split('-')[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{perfume.name}</h2>
              <p className="text-xs text-gray-500">{perfume.id}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-3">{perfume.description}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-1">
            {perfume.keywords.map((keyword, index) => (
              <span key={index} className="px-2 py-0.5 bg-pink-100 text-pink-800 text-xs rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 피드백 폼 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">향수 피드백</h2>
          
          {/* 향 유지 비율 */}
          <div className="mb-5 bg-white rounded-xl shadow-md p-4">
            <h3 className="text-base font-semibold text-gray-700 mb-2">향 유지 비율</h3>
            <p className="text-xs text-gray-600 mb-3">
              추천 향수의 기본 조합에서 얼마나 유지하고 싶으신가요?
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              {[0, 20, 40, 60, 80, 100].map((value) => (
                <label 
                  key={value} 
                  className={`
                    border rounded-md p-2 flex flex-col items-center cursor-pointer transition-colors
                    ${feedback.retentionPercentage === value 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="retentionPercentage"
                    value={value}
                    checked={feedback.retentionPercentage === value}
                    onChange={() => handleRadioChange(value)}
                    className="sr-only"
                  />
                  <span className="text-base font-bold text-gray-700">{value}%</span>
                  <span className="text-[9px] text-gray-500">
                    {value === 0 && '완전 변경'}
                    {value === 100 && '완전 유지'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 향 특성 슬라이더 */}
          <div className="mb-5 bg-white rounded-xl shadow-md p-4">
            <h3 className="text-base font-semibold text-gray-700 mb-2">향 특성 조정</h3>
            
            {/* 향의 강도 */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <label htmlFor="intensity" className="text-sm font-medium text-gray-700">향의 강도</label>
                <span className="text-xs text-gray-500">{feedback.intensity}/5</span>
              </div>
              <input
                type="range"
                id="intensity"
                name="intensity"
                min="1"
                max="5"
                value={feedback.intensity}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>약함</span>
                <span>강함</span>
              </div>
            </div>
            
            {/* 단맛 */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <label htmlFor="sweetness" className="text-sm font-medium text-gray-700">단맛</label>
                <span className="text-xs text-gray-500">{feedback.sweetness}/5</span>
              </div>
              <input
                type="range"
                id="sweetness"
                name="sweetness"
                min="1"
                max="5"
                value={feedback.sweetness}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>적게</span>
                <span>많이</span>
              </div>
            </div>
            
            {/* 쓴맛 */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <label htmlFor="bitterness" className="text-sm font-medium text-gray-700">쓴맛</label>
                <span className="text-xs text-gray-500">{feedback.bitterness}/5</span>
              </div>
              <input
                type="range"
                id="bitterness"
                name="bitterness"
                min="1"
                max="5"
                value={feedback.bitterness}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>적게</span>
                <span>많이</span>
              </div>
            </div>
            
            {/* 시큼함 */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <label htmlFor="sourness" className="text-sm font-medium text-gray-700">시큼함</label>
                <span className="text-xs text-gray-500">{feedback.sourness}/5</span>
              </div>
              <input
                type="range"
                id="sourness"
                name="sourness"
                min="1"
                max="5"
                value={feedback.sourness}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>적게</span>
                <span>많이</span>
              </div>
            </div>
            
            {/* 신선함 */}
            <div className="mb-1">
              <div className="flex justify-between mb-1">
                <label htmlFor="freshness" className="text-sm font-medium text-gray-700">신선함</label>
                <span className="text-xs text-gray-500">{feedback.freshness}/5</span>
              </div>
              <input
                type="range"
                id="freshness"
                name="freshness"
                min="1"
                max="5"
                value={feedback.freshness}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>적게</span>
                <span>많이</span>
              </div>
            </div>
          </div>
          
          {/* 추가 코멘트 */}
          <div className="mb-5 bg-white rounded-xl shadow-md p-4">
            <h3 className="text-base font-semibold text-gray-700 mb-2">추가 코멘트</h3>
            <textarea
              id="notes"
              name="notes"
              value={feedback.notes}
              onChange={handleNotesChange}
              placeholder="향수에 대한 추가 의견이나 바라는 점을 자유롭게 작성해주세요."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
            />
          </div>
          
          {/* 버튼 영역 */}
          <div className="flex flex-col justify-center gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="bg-yellow-400 text-gray-800 font-bold py-2.5 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors w-full"
            >
              피드백 제출하기
            </button>
            <button
              onClick={handleBack}
              className="bg-white border-2 border-gray-800 text-gray-800 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-100 transition-colors w-full"
            >
              이전으로 돌아가기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 