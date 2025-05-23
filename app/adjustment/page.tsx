"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PerfumePersona } from '@/app/types/perfume';
import { motion } from 'framer-motion';

// 향수 피드백 인터페이스
interface PerfumeFeedback {
  perfumeId: string;
  retentionPercentage: number;
  intensity: number;
  sweetness: number;
  bitterness: number;
  sourness: number;
  freshness: number;
  notes: string;
}

// 노트 조정 정보 인터페이스
interface NoteAdjustment {
  type: 'base' | 'increase' | 'reduce';
  noteId?: string;
  noteName?: string;
  description: string;
  amount: string;
}

// 향수 조정 추천 인터페이스
interface AdjustmentRecommendation {
  perfumeId: string;
  perfumeName: string;
  baseRetention: number;
  baseAmount: string;
  adjustments: NoteAdjustment[];
  totalAdjustments: number;
  explanation: string;
}

export default function AdjustmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perfume, setPerfume] = useState<PerfumePersona | null>(null);
  const [feedback, setFeedback] = useState<PerfumeFeedback | null>(null);
  const [recommendations, setRecommendations] = useState<AdjustmentRecommendation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    try {
      // 로컬 스토리지에서 피드백 데이터와 분석 결과 불러오기
      const storedFeedback = localStorage.getItem('perfumeFeedback');
      const storedResult = localStorage.getItem('analysisResult');
      
      if (!storedFeedback || !storedResult) {
        setError('피드백 또는 분석 결과를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      
      // 분석 결과 파싱하여 향수 정보 가져오기
      const parsedResult = JSON.parse(storedResult);
      const parsedFeedback = JSON.parse(storedFeedback);
      
      setFeedback(parsedFeedback);
      
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
    } catch (err) {
      console.error('결과 로딩 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, []);
  
  // 향수 조정 추천 API 호출
  const fetchAdjustments = async (feedbackData: PerfumeFeedback) => {
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
      setIsLoaded(true);
    } catch (error) {
      console.error('조정 추천 로딩 오류:', error);
      setError('향수 조정 추천을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };
  
  // 피드백 페이지로 돌아가기
  const handleBack = () => {
    router.push('/feedback');
  };
  
  // 향수 확정 페이지로 이동
  const handleConfirm = () => {
    router.push('/final');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="flex justify-center items-center mb-4">
          <div className="animate-bounce bg-yellow-400 rounded-full h-4 w-4 mr-1"></div>
          <div className="animate-bounce bg-yellow-300 rounded-full h-4 w-4 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-yellow-200 rounded-full h-4 w-4" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-yellow-800 font-medium">향수 조정 안내를 생성하는 중...</p>
      </div>
    );
  }

  if (error || !perfume || !feedback || !recommendations) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center flex-col p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-4">오류 발생</h2>
          <p className="text-gray-700 mb-6">{error || '향수 조정 정보를 불러올 수 없습니다. 다시 시도해주세요.'}</p>
          <button
            onClick={() => router.push('/feedback')}
            className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
          >
            피드백 페이지로 돌아가기
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
            <span className="bg-yellow-300 px-2 py-1">향수 조정 안내</span>
          </h1>
          <p className="text-gray-600 text-sm">
            피드백을 바탕으로 한 맞춤 향수 조정 방법입니다.
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
          
          <p className="text-sm text-gray-700">{recommendations.explanation}</p>
        </div>
        
        {/* 조정 안내 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">향수 조정 레시피</h2>
          
          <div className="space-y-4">
            {/* 기본 베이스 */}
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-2">베이스 향수</h3>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{perfume.name} 베이스</p>
                    <p className="text-xs text-gray-500">기본 배합의 {recommendations.baseRetention}%</p>
                  </div>
                  <span className="text-base font-bold text-yellow-800">{recommendations.baseAmount}</span>
                </div>
              </div>
            </div>
            
            {/* 노트 조정 */}
            {recommendations.adjustments.filter(adj => adj.type !== 'base').length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">노트 조정</h3>
                <div className="space-y-2">
                  {recommendations.adjustments
                    .filter(adj => adj.type !== 'base')
                    .map((adjustment, index) => (
                      <div 
                        key={index} 
                        className={`
                          p-3 rounded-lg border 
                          ${adjustment.type === 'increase' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {adjustment.noteName}
                              <span className="ml-2 text-xs text-gray-500">
                                ({adjustment.type === 'increase' ? '추가' : '감소'})
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">{adjustment.description}</p>
                          </div>
                          <span className={`
                            text-base font-bold
                            ${adjustment.type === 'increase' ? 'text-green-700' : 'text-red-700'}
                          `}>
                            {adjustment.type === 'increase' ? '+' : '-'}{adjustment.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 주의사항 및 정보 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">조정 안내 및 주의사항</h2>
          
          <div className="space-y-2 text-gray-700 text-sm">
            <p>✓ 위 레시피는 {perfume.name} 향수를 기본으로 한 맞춤 조정 안내입니다.</p>
            <p>✓ 향수 공방에서 위 레시피를 보여주시면 조향사가 도와드립니다.</p>
            <p>✓ 노트 추가량은 그램(g) 또는 밀리리터(ml) 단위로 표시됩니다.</p>
            <p>✓ 향은 시간이 지남에 따라 변화할 수 있으며, 피부 타입에 따라 다르게 발현될 수 있습니다.</p>
            <p>✓ 알레르기가 있으신 분들은 사용 전 패치 테스트를 권장합니다.</p>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              맞춤 향수는 조향사의 판단에 따라 일부 성분이 조정될 수 있으며, 정확한 레시피는 향수 공방에서 전문가와 상담 후 최종 결정됩니다.
            </p>
          </div>
        </div>
        
        {/* 버튼 영역 */}
        <div className="flex flex-col justify-center gap-3 my-6">
          <button
            onClick={handleConfirm}
            className="bg-yellow-400 text-gray-800 font-bold py-2.5 px-6 rounded-full shadow-md hover:bg-yellow-500 transition-colors w-full"
          >
            향수 확정하기
          </button>
          <button
            onClick={handleBack}
            className="bg-white border-2 border-gray-800 text-gray-800 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-100 transition-colors w-full"
          >
            피드백 수정하기
          </button>
        </div>
      </motion.div>
    </div>
  );
} 