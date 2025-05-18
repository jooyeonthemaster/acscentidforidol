"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Doughnut } from 'react-chartjs-2';
import { CustomPerfumeRecipe, PerfumeFeedback } from '@/app/types/perfume';
import { CHARACTERISTIC_NAMES } from '../constants/characteristics';
import { characteristicToSliderValue } from '../constants/characteristics';
import { formatScentCode } from '../utils/formatters';

interface SuccessViewProps {
  feedback: PerfumeFeedback;
  recipe: CustomPerfumeRecipe | null;
  customizationLoading: boolean;
  onClose: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ 
  feedback, 
  recipe, 
  customizationLoading, 
  onClose 
}) => {
  return (
    <div className="py-4 flex flex-col">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      
      <h3 className="text-center text-xl font-bold text-gray-800 mb-4">
        맞춤 향수 레시피가 준비되었습니다!
      </h3>
      
      {customizationLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 border-4 border-t-transparent border-orange-500 rounded-full animate-spin mb-6"></div>
          <p className="text-orange-600 font-bold">맞춤 향수 레시피 생성 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요. 최대 15초 정도 소요됩니다.</p>
        </div>
      ) : recipe ? (
        <div className="mt-6 space-y-8">
          {/* 피드백 반영 시각화 - Before & After */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md">
            <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
              <span className="text-lg mr-2">✨</span> 피드백이 반영된 결과
            </h4>
            
            {/* 유지 비율 시각화 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">기존 향 유지 비율</p>
                <p className="text-sm font-medium text-blue-600">{feedback.retentionPercentage}%</p>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                  style={{ width: `${feedback.retentionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* 향 특성 Before & After */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <p className="text-sm font-medium text-gray-700 mb-2">향 특성 변화</p>
              
              <div className="aspect-square w-full max-w-md mx-auto">
                {/* 레이더 차트 */}
                <Radar 
                  data={{
                    labels: Object.keys(CHARACTERISTIC_NAMES).map(key => CHARACTERISTIC_NAMES[key as any]),
                    datasets: [
                      {
                        label: '변경 전',
                        data: Object.keys(CHARACTERISTIC_NAMES).map(() => 3), // 기본값 중간(3)
                        backgroundColor: 'rgba(99, 112, 241, 0.2)',
                        borderColor: 'rgba(99, 112, 241, 1)',
                        borderWidth: 1,
                      },
                      {
                        label: '변경 후',
                        data: Object.keys(CHARACTERISTIC_NAMES).map(key => 
                          characteristicToSliderValue(feedback.userCharacteristics?.[key as any] || 'medium')
                        ),
                        backgroundColor: 'rgba(239, 134, 51, 0.2)',
                        borderColor: 'rgba(239, 134, 51, 1)',
                        borderWidth: 1,
                      }
                    ]
                  }}
                  options={{
                    scales: {
                      r: {
                        min: 0,
                        max: 5,
                        ticks: {
                          stepSize: 1,
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* 선택한 특성 목록 */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {Object.entries(feedback.userCharacteristics || {}).map(([char, value]) => (
                <div key={char} className="bg-white rounded-lg p-3 border border-blue-100 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-2">
                    {char === 'weight' && '⚖️'}
                    {char === 'sweetness' && '🍯'}
                    {char === 'freshness' && '❄️'}
                    {char === 'uniqueness' && '✨'}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{CHARACTERISTIC_NAMES[char as any]}</p>
                    <p className="text-sm font-medium text-blue-600">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 레시피 시각화 - 도넛 차트 */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200 shadow-md">
            <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
              <span className="text-lg mr-2">📊</span> 레시피 구성 비율
            </h4>
            
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2 aspect-square max-w-[200px] mx-auto">
                <Doughnut 
                  data={{
                    labels: recipe.recipe10ml?.map(c => formatScentCode(c.name)) || [],
                    datasets: [{
                      data: recipe.recipe10ml?.map(c => c.percentage) || [],
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                      ],
                      borderWidth: 1,
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-1/2">
                <div className="grid grid-cols-1 gap-2">
                  {recipe.recipe10ml?.map((component, i) => (
                    <div key={i} className="flex items-center p-2 bg-white rounded-lg border border-orange-100">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ 
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.7)',
                          'rgba(54, 162, 235, 0.7)',
                          'rgba(255, 206, 86, 0.7)',
                          'rgba(75, 192, 192, 0.7)',
                          'rgba(153, 102, 255, 0.7)',
                        ][i % 5]
                      }}></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-semibold text-gray-700">{formatScentCode(component.name || '')}</span>
                          <span className="text-xs font-medium text-orange-600">{component.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
            >
              확인 완료
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-700">
            피드백이 성공적으로 제출되었습니다!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            소중한 의견 감사합니다. 향수 추천 품질 향상에 큰 도움이 됩니다.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};