"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfumePersona } from '@/app/types/perfume';

// 향수 조정 추천 인터페이스
interface AdjustmentRecommendation {
  perfumeId: string;
  perfumeName: string;
  baseRetention: number;
  baseAmount: string;
  adjustments: {
    type: 'base' | 'increase' | 'reduce';
    noteId?: string;
    noteName?: string;
    description: string;
    amount: string;
  }[];
  totalAdjustments: number;
  explanation: string;
}

export default function FinalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfume, setPerfume] = useState<PerfumePersona | null>(null);
  const [recommendations, setRecommendations] = useState<AdjustmentRecommendation | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  
  useEffect(() => {
    try {
      // 로컬 스토리지에서 분석 결과와 향수 조정 추천 정보 불러오기
      const storedResult = localStorage.getItem('analysisResult');
      const storedFeedback = localStorage.getItem('perfumeFeedback');
      
      if (!storedResult || !storedFeedback) {
        setError('필요한 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 분석 결과 파싱하여 향수 정보 가져오기
      const parsedResult = JSON.parse(storedResult);
      const parsedFeedback = JSON.parse(storedFeedback);
      
      // 추천 향수 찾기
      const topMatch = parsedResult.matchingPerfumes?.find((p: any) => p.persona);
      
      if (!topMatch || !topMatch.persona) {
        setError('추천된 향수 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      setPerfume(topMatch.persona);
      
      // API 호출하여 향수 조정 추천받기
      fetchAdjustments(parsedFeedback);
      
      // 확인 코드 생성
      generateConfirmationCode(topMatch.persona.id);
    } catch (err) {
      console.error('결과 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, []);
  
  // 향수 조정 추천 API 호출
  const fetchAdjustments = async (feedbackData: any) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error('향수 조정 추천을 받는데 실패했습니다.');
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations);
      setLoading(false);
    } catch (error) {
      console.error('조정 추천 로딩 오류:', error);
      setError('향수 조정 추천을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 확인 코드 생성
  const generateConfirmationCode = (perfumeId: string) => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const code = `${perfumeId.substring(0, 2)}-${timestamp}`;
    setConfirmationCode(code);
  };
  
  // 조정 페이지로 돌아가기
  const handleBack = () => {
    router.push('/adjustment');
  };
  
  // 홈으로 돌아가기
  const handleGoHome = () => {
    // 로컬 스토리지 초기화 (선택적)
    // localStorage.clear();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-bounce bg-yellow-400 rounded-full h-4 w-4 mr-1"></div>
          <div className="animate-bounce bg-yellow-300 rounded-full h-4 w-4 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-yellow-200 rounded-full h-4 w-4" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-yellow-800 font-medium">향수 확정 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !perfume || !recommendations) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">오류 발생</h2>
          <p className="text-gray-700 mb-6">{error || '향수 정보를 불러올 수 없습니다. 다시 시도해주세요.'}</p>
          <button
            onClick={() => router.push('/adjustment')}
            className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            조정 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 영역 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="bg-yellow-300 px-2 py-1">향수 확정 완료</span>
          </h1>
          <p className="text-gray-600">
            맞춤 향수 레시피가 성공적으로 생성되었습니다.
          </p>
        </div>
        
        {/* 확인 메시지 */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-500 text-white rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-800">맞춤 향수 제작 확정!</h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            맞춤 향수 레시피가 성공적으로 확정되었습니다. 아래의 확인 코드를 향수 공방에 제시하면 제작을 도와드립니다.
          </p>
          
          <div className="bg-white rounded-lg border-2 border-green-300 p-4 text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">확인 코드</p>
            <p className="text-3xl font-bold text-green-700 tracking-wider">{confirmationCode}</p>
          </div>
          
          <p className="text-sm text-gray-600">
            * 이 코드는 향수 공방 방문 시 제시해 주세요. 코드는 48시간 동안 유효합니다.
          </p>
        </div>
        
        {/* 향수 레시피 요약 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">맞춤 향수 레시피 요약</h2>
          
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
              {perfume.id.split('-')[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{perfume.name}</h2>
              <p className="text-gray-500">{recommendations.baseRetention}% 베이스 + 맞춤 조정</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{recommendations.explanation}</p>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">조정 세부 사항</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 베이스 향수: {recommendations.baseAmount}</li>
              {recommendations.adjustments
                .filter(adj => adj.type !== 'base')
                .map((adjustment, index) => (
                  <li key={index}>
                    • {adjustment.noteName}: {adjustment.type === 'increase' ? '+' : '-'}{adjustment.amount} ({adjustment.description})
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        
        {/* 다음 단계 안내 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">다음 단계</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-300 flex items-center justify-center font-bold text-yellow-800 mr-3">
                1
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">향수 공방 방문</h3>
                <p className="text-gray-600">가까운 제휴 향수 공방을 방문하세요.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-300 flex items-center justify-center font-bold text-yellow-800 mr-3">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">확인 코드 제시</h3>
                <p className="text-gray-600">공방 직원에게 확인 코드를 보여주세요.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-300 flex items-center justify-center font-bold text-yellow-800 mr-3">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">향수 제작 및 시향</h3>
                <p className="text-gray-600">조향사가 레시피에 맞춰 향수를 제작해 드립니다.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-300 flex items-center justify-center font-bold text-yellow-800 mr-3">
                4
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">맞춤 향수 완성</h3>
                <p className="text-gray-600">나만의 특별한 맞춤 향수를 받아가세요!</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button
            onClick={handleBack}
            className="bg-white border-2 border-gray-800 text-gray-800 font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            향수 조정 수정하기
          </button>
          <button
            onClick={handleGoHome}
            className="bg-yellow-400 text-gray-800 font-bold py-3 px-8 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
        
        {/* 푸터 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>AC&apos;SCENT IDENTITY - 나만의 향수 찾기</p>
          <p className="mt-1">확인 코드: {confirmationCode}</p>
        </div>
      </div>
    </div>
  );
} 