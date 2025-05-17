"use client";

import React, { useEffect, useState } from 'react';
import { Perfume, extractPerfumeId } from '@/utils/perfume';

interface PerfumeRecommendationProps {
  recommendation: string;
}

interface ImageAnalysis {
  mood: string;
  colors: string;
  style: string;
  emotion: string;
  features: string;
}

interface PerfumeMatch {
  noteAnalysis: string;
  reasonDetail: string;
  matchingPoints: string;
}

export default function PerfumeRecommendation({ recommendation }: PerfumeRecommendationProps) {
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [perfumeMatch, setPerfumeMatch] = useState<PerfumeMatch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPerfume = async () => {
      // 향수 ID 추출
      const perfumeId = extractPerfumeId(recommendation);
      console.log('추출된 향수 ID:', perfumeId);
      
      if (perfumeId) {
        try {
          setLoading(true);
          setError(null);
          
          // API 호출하여 향수 정보 가져오기
          console.log(`향수 정보 요청: /api/perfume?id=${perfumeId}`);
          const response = await fetch(`/api/perfume?id=${perfumeId}`);
          
          if (!response.ok) {
            console.error(`향수 정보 API 응답 오류: ${response.status} ${response.statusText}`);
            throw new Error('향수 정보를 가져오는데 실패했습니다.');
          }
          
          const data = await response.json();
          console.log('향수 정보 응답:', data);
          
          if (!data.perfume) {
            console.error('API 응답에 향수 정보가 없습니다:', data);
            throw new Error('향수 정보가 없습니다.');
          }
          
          setPerfume(data.perfume);
          
          // 이미지 분석 결과 추출
          extractImageAnalysis(recommendation);
          
          // 향수 매칭 정보 추출
          extractPerfumeMatch(recommendation);
          
        } catch (error) {
          console.error('향수 정보 로딩 오류:', error);
          setError('향수 정보를 불러오는데 문제가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('추천 텍스트에서 향수 ID를 추출할 수 없습니다:', recommendation);
        setError('향수 ID를 찾을 수 없습니다.');
        setLoading(false);
      }
    };
    
    fetchPerfume();
  }, [recommendation]);

  // 이미지 분석 결과 추출
  const extractImageAnalysis = (text: string) => {
    const analysisSection = text.match(/===이미지 분석===\s*([\s\S]*?)(?:===향수 추천===|$)/);
    
    if (analysisSection && analysisSection[1]) {
      const section = analysisSection[1];
      
      const mood = section.match(/분위기:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const colors = section.match(/색감:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const style = section.match(/스타일:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const emotion = section.match(/감정:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const features = section.match(/특징:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      
      setImageAnalysis({
        mood,
        colors,
        style,
        emotion,
        features
      });
    } else {
      // 기존 형식이나 정규식이 매칭되지 않는 경우 null로 설정
      setImageAnalysis(null);
    }
  };
  
  // 향수 매칭 정보 추출
  const extractPerfumeMatch = (text: string) => {
    const recommendSection = text.match(/===향수 추천===\s*([\s\S]*?)$/);
    
    if (recommendSection && recommendSection[1]) {
      const section = recommendSection[1];
      
      const noteAnalysis = section.match(/노트 분석:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const reasonDetail = section.match(/추천 이유:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      const matchingPoints = section.match(/매칭 포인트:\s*(.*?)(?:\n|$)/)?.[1]?.trim() || '';
      
      setPerfumeMatch({
        noteAnalysis,
        reasonDetail,
        matchingPoints
      });
    } else {
      // 기존 형식에서 추천 이유만 추출
      const reasonMatch = recommendation.match(/추천 이유:?\s*(.+?)(?=\n|$)/);
      if (reasonMatch && reasonMatch[1]) {
        setPerfumeMatch({
          noteAnalysis: '',
          reasonDetail: reasonMatch[1].trim(),
          matchingPoints: ''
        });
      } else {
        setPerfumeMatch(null);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-pink-200 mt-4 mb-2 max-w-lg mx-auto">
        <div className="flex justify-center items-center p-4">
          <div className="animate-bounce bg-pink-400 rounded-full h-3 w-3 mr-1"></div>
          <div className="animate-bounce bg-pink-300 rounded-full h-3 w-3 mr-1" style={{ animationDelay: '0.2s' }}></div>
          <div className="animate-bounce bg-pink-200 rounded-full h-3 w-3" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-center text-gray-500">향수 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-pink-200 mt-4 mb-2 max-w-lg mx-auto">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!perfume) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-pink-200 mt-4 mb-2 max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-center mb-4 text-pink-600">💕 향수 추천 결과 💕</h3>
      
      {/* 이미지 분석 결과 */}
      {imageAnalysis && (
        <div className="mb-5 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-pink-600 mb-2 text-lg border-b border-pink-200 pb-1">✨ 이미지 분석</h4>
          <div className="space-y-2 mt-3">
            {imageAnalysis.mood && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">분위기:</span>
                <span className="text-gray-600">{imageAnalysis.mood}</span>
              </div>
            )}
            {imageAnalysis.colors && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">색감:</span>
                <span className="text-gray-600">{imageAnalysis.colors}</span>
              </div>
            )}
            {imageAnalysis.style && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">스타일:</span>
                <span className="text-gray-600">{imageAnalysis.style}</span>
              </div>
            )}
            {imageAnalysis.emotion && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">감정:</span>
                <span className="text-gray-600">{imageAnalysis.emotion}</span>
              </div>
            )}
            {imageAnalysis.features && (
              <div className="flex">
                <span className="font-medium text-gray-700 w-20">특징:</span>
                <span className="text-gray-600">{imageAnalysis.features}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 향수 정보 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
        <h4 className="font-semibold text-pink-600 mb-2 text-lg border-b border-pink-200 pb-1">🌸 추천 향수</h4>
        <div className="flex items-center mt-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
            {perfume.id.split('-')[0]}
          </div>
          <div>
            <h4 className="text-lg font-semibold">{perfume.name}</h4>
            <p className="text-sm text-gray-500">{perfume.id}</p>
          </div>
        </div>
      </div>
      
      {/* 향수 설명 */}
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-pink-600">향수 설명</h5>
          <p className="text-gray-700 mt-1">{perfume.description}</p>
        </div>
        
        <div>
          <h5 className="font-medium text-pink-600">분위기</h5>
          <div className="flex flex-wrap gap-2 mt-1">
            {perfume.mood.split(',').map((mood, index) => (
              <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                {mood.trim()}
              </span>
            ))}
          </div>
        </div>
        
        {/* 향수 매칭 정보 */}
        {perfumeMatch && (
          <div className="space-y-3 mt-2 p-3 bg-gradient-to-r from-yellow-50 to-pink-50 rounded-lg">
            <h5 className="font-medium text-pink-600 border-b border-pink-100 pb-1">매칭 분석</h5>
            
            {perfumeMatch.noteAnalysis && (
              <div>
                <h6 className="text-sm font-medium text-gray-700">노트 분석</h6>
                <p className="text-gray-600 text-sm">{perfumeMatch.noteAnalysis}</p>
              </div>
            )}
            
            <div>
              <h6 className="text-sm font-medium text-gray-700">추천 이유</h6>
              <p className="text-gray-600 text-sm">{perfumeMatch.reasonDetail || '이 향수는 이미지의 분위기와 잘 어울립니다.'}</p>
            </div>
            
            {perfumeMatch.matchingPoints && (
              <div>
                <h6 className="text-sm font-medium text-gray-700">매칭 포인트</h6>
                <p className="text-gray-600 text-sm">{perfumeMatch.matchingPoints}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}