'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPerfumeById } from '../../data/perfumeData';
import PerfumeRadarChart from '../../components/PerfumeRadarChart/index';
import { getCategoryKoreanName } from '../../utils/perfumeUtils';

export default function PerfumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const perfume = getPerfumeById(id);
  
  if (!perfume) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">향수를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-4">요청하신 ID: {id}</p>
          <button
            onClick={() => router.push('/perfumes')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            향수 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/perfumes')}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mb-6"
      >
        ← 향수 목록으로 돌아가기
      </button>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold">{perfume.name}</h1>
            <p className="text-gray-500">{perfume.id}</p>
            
            <div className="mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {getCategoryKoreanName(perfume.category)} 계열
              </span>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">향 성분</h2>
              
              <div className="mb-4">
                <h3 className="font-bold">메인 향: {perfume.mainScent.name}</h3>
                <p className="text-gray-600 mt-1">{perfume.mainScent.description}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold">서브향 1: {perfume.subScent1.name}</h3>
                <p className="text-gray-600 mt-1">{perfume.subScent1.description}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold">서브향 2: {perfume.subScent2.name}</h3>
                <p className="text-gray-600 mt-1">{perfume.subScent2.description}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">향 묘사</h2>
              <p className="text-gray-600">{perfume.description}</p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">추천 대상</h2>
              <p className="text-gray-600">{perfume.recommendation}</p>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">향 특성 분석</h2>
            <PerfumeRadarChart perfume={perfume} />
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">시트러스</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full" 
                    style={{ width: `${(perfume.characteristics.citrus / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.citrus}/9</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">플로럴</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-pink-400 h-full" 
                    style={{ width: `${(perfume.characteristics.floral / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.floral}/9</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">우디</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-brown-400 h-full" 
                    style={{ width: `${(perfume.characteristics.woody / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.woody}/9</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">머스크</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-purple-400 h-full" 
                    style={{ width: `${(perfume.characteristics.musk / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.musk}/9</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">프루티</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-red-400 h-full" 
                    style={{ width: `${(perfume.characteristics.fruity / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.fruity}/9</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded">
                <h3 className="font-bold">스파이시</h3>
                <div className="mt-1 bg-gray-200 h-4 rounded overflow-hidden">
                  <div 
                    className="bg-orange-400 h-full" 
                    style={{ width: `${(perfume.characteristics.spicy / 9) * 100}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1">{perfume.characteristics.spicy}/9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}