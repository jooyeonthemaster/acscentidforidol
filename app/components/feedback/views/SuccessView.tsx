"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Doughnut } from 'react-chartjs-2';
import { GeminiPerfumeSuggestion, PerfumeFeedback, PerfumePersona, CategoryDataPoint, TestingGranule } from '@/app/types/perfume';
import { CHARACTERISTIC_NAMES } from '../constants/characteristics';
import { characteristicToSliderValue } from '../constants/characteristics';
import { formatScentCode, formatScentDisplay, findScentNameById, findScentIdByName } from '../utils/formatters';
import { getScentMainCategory } from '../utils/scentUtils';
import perfumePersonasData from '@/app/data/perfumePersonas';
import Image from 'next/image';
import GranuleIcon from '../components/GranuleIcon';
import ScentInfoToggle from '../components/ScentInfoToggle';
import TestingRecipeSection from '../components/TestingRecipeSection';
import CategoryChangeRadar from '../components/CategoryChangeRadar';

interface SuccessViewProps {
  feedback: PerfumeFeedback;
  recipe: GeminiPerfumeSuggestion | null;
  originalPerfume: PerfumePersona;
  customizationLoading: boolean;
  onClose: () => void;
  onResetForm?: () => void;
}

interface ConfirmedRecipeDetail {
  name: string;
  id: string;
  amount10ml: number; // 1g 기준
  amount50ml: number; // 5g 기준
}

export const SuccessView: React.FC<SuccessViewProps> = ({ 
  feedback, 
  recipe, 
  originalPerfume,
  customizationLoading, 
  onClose, 
  onResetForm
}) => {
  const [isRecipeConfirmed, setIsRecipeConfirmed] = useState(false);
  const [confirmedRecipeDetails, setConfirmedRecipeDetails] = useState<ConfirmedRecipeDetail[]>([]);

  const handleConfirmRecipe = () => {
    if (recipe?.testingRecipe?.granules) {
      const details: ConfirmedRecipeDetail[] = recipe.testingRecipe.granules.map(granule => {
        const ratio = granule.ratio / 100;
        return {
          name: granule.name,
          id: granule.id,
          amount10ml: parseFloat((ratio * 1).toFixed(3)), // 소수점 3자리까지
          amount50ml: parseFloat((ratio * 5).toFixed(3)), // 소수점 3자리까지
        };
      });
      setConfirmedRecipeDetails(details);
      setIsRecipeConfirmed(true);
    }
  };

  const processedGranulesForDonut = React.useMemo(() => {
    if (!recipe?.testingRecipe?.granules) return [];
    return recipe.testingRecipe.granules.slice(0, 5).map(granule => ({
      id: granule.id,
      name: granule.name,
      percentage: granule.ratio, 
      mainCategory: granule.mainCategory || getScentMainCategory(granule.id)
    }));
  }, [recipe]);

  const doughnutChartData = {
    labels: processedGranulesForDonut.map(g => `${g.name} (${g.id})`),
    datasets: [{
      data: processedGranulesForDonut.map(g => g.percentage),
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
      borderRadius: 5,
    }]
  };

  if (isRecipeConfirmed) {
    return (
      <div className="py-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-5 bg-green-50 rounded-full p-2 shadow-md" 
        >
          <Image src="/cute2.png" alt="Cute Character Happy" width={112} height={112} className="object-contain" />
        </motion.div>
        <h3 className="text-2xl font-bold text-green-600 mb-1">🎉 조향 레시피 확정! 🎉</h3>
        <p className="text-gray-600 mb-6 text-sm">아래 레시피에 따라 향료를 첨가하여 나만의 향수를 만들어보세요!</p>

        <div className="w-full max-w-md mx-auto space-y-6">
          {/* 10ml 향수 레시피 */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-5">
            <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
              <span className="text-xl mr-2">💧</span>10ml 향수 만들기 (총 향료: 1g)
            </h4>
            <ul className="space-y-2 text-left">
              {confirmedRecipeDetails.map((item, index) => (
                <li key={`10ml-${item.id}-${index}`} className="flex justify-between items-center p-2 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                  <span className="text-sm text-gray-700">{item.name} ({item.id})</span>
                  <span className="text-sm font-medium text-green-600">{item.amount10ml} g</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 50ml 향수 레시피 */}
          <div className="bg-white rounded-xl shadow-lg border border-green-100 p-5">
            <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
              <span className="text-xl mr-2">🧪</span>50ml 향수 만들기 (총 향료: 5g)
            </h4>
            <ul className="space-y-2 text-left">
              {confirmedRecipeDetails.map((item, index) => (
                <li key={`50ml-${item.id}-${index}`} className="flex justify-between items-center p-2 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                  <span className="text-sm text-gray-700">{item.name} ({item.id})</span>
                  <span className="text-sm font-medium text-green-600">{item.amount50ml} g</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center mt-10 space-y-4 w-full px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetForm}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md flex items-center justify-center font-medium"
          >
            새로운 피드백 작성
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center font-medium"
          >
            닫기
          </motion.button>
        </div>
      </div>
    );
  }

  if (recipe?.isFinalRecipe && !recipe.testingRecipe) {
    return (
      <div className="py-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-5 bg-green-50 rounded-full p-2 shadow-md" 
        >
          <Image src="/cute2.png" alt="Cute Character Happy" width={112} height={112} className="object-contain" />
        </motion.div>
        <h3 className="text-2xl font-bold text-green-600 mb-3">🎉 레시피 확정!</h3>
        <div className="bg-white rounded-lg shadow-md border border-green-100 p-5 max-w-md mx-auto">
          <p className="text-gray-700 mb-3">
            {recipe.overallExplanation || `${recipe.originalPerfumeName} 향을 100% 유지하는 것을 선택하셨습니다. 추가 조정 없이 원본의 매력을 그대로 즐기실 수 있습니다.`}
          </p>
          {recipe.finalRecipeDetails?.description && (
            <p className="text-sm text-gray-600 mt-3 mb-2 p-3 bg-green-50 rounded-md">{recipe.finalRecipeDetails.description}</p>
          )}
        </div>
        <div className="flex flex-col items-center mt-8 space-y-4 w-full px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetForm}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md flex items-center justify-center font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            다시 피드백 기록하기
          </motion.button>
          {!isRecipeConfirmed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmRecipe}
              className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md flex items-center justify-center font-medium"
            >
              <span className="mr-2">레시피 확정하기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 flex flex-col">
      <div className="relative flex flex-col items-center mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative bg-gradient-to-r from-amber-400 to-orange-500 p-4 rounded-lg shadow-lg max-w-xs text-center mb-3"
        >
          <p className="text-base md:text-lg font-semibold text-white">
            ✨ 맞춤 향수 레시피가 준비되었습니다!
          </p>
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-3 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '12px solid #F59E0B',
            }}
          ></div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center bg-orange-50 rounded-full p-2 shadow-md" 
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-6, 6, -6] }} 
            transition={{
              duration: 2.5, 
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            <Image src="/cute2.png" alt="Cute Character Surprised" width={112} height={112} className="object-contain" />
          </motion.div>
        </motion.div>
      </div>
      
      {customizationLoading ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl shadow-md border border-orange-100">
          <div className="w-16 h-16 border-4 border-t-transparent border-orange-500 rounded-full animate-spin mb-6"></div>
          <p className="text-orange-600 font-bold text-lg">맞춤 향수 레시피 생성 중...</p>
          <p className="text-sm text-gray-500 mt-3 max-w-xs text-center">잠시만 기다려주세요. 고객님의 피드백을 반영한 맞춤형 향수 레시피를 준비하고 있습니다. 최대 15초 정도 소요됩니다.</p>
        </div>
      ) : recipe ? (
        <div className="mt-6 space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-blue-200">
              <h4 className="font-bold text-blue-800 text-lg flex items-center">
                <span className="text-xl mr-2">🔍</span> 피드백 반영 결과
              </h4>
              <div className="bg-white rounded-full px-3 py-1 text-xs font-medium text-blue-600 border border-blue-100 shadow-sm">
                원본 향 {recipe.retentionPercentage}% 유지
              </div>
            </div>
            
            {recipe.contradictionWarning && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-5"
              >
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 shadow-sm flex items-start">
                  <span className="text-xl text-yellow-500 mr-3">⚠️</span>
                  <div>
                    <p className="font-semibold text-yellow-700 mb-1">피드백 모순 알림</p>
                    <p className="text-sm text-yellow-600">{recipe.contradictionWarning.message}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {recipe.overallExplanation && (
              <div className="mb-6 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
                <p className="font-semibold text-blue-800 mb-2 flex items-center">
                  <span className="text-lg mr-2">💡</span> AI의 종합 의견
                </p>
                <p className="text-gray-700">{recipe.overallExplanation}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">기존 향 유지 비율</p>
                <p className="text-sm font-bold text-blue-600">{recipe.retentionPercentage}%</p>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden shadow-inner border border-blue-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${recipe.retentionPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                ></motion.div>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-lg h-[380px] sm:h-[400px] md:h-[450px] mb-6 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <p className="font-semibold text-blue-800 mb-4 flex items-center justify-center">
                <span className="text-lg mr-2">📊</span> 향 프로필 변화
              </p>
              <CategoryChangeRadar feedback={feedback} recipe={recipe} originalPerfume={originalPerfume} />
            </div>
            
            {recipe.categoryChanges && recipe.categoryChanges.length > 0 && (
              <div className="mt-5">
                <p className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">🔄</span> 주요 카테고리 변화
                </p>
                <div className="flex flex-col space-y-3">
                  {recipe.categoryChanges.map((change, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.4 }}
                      className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {change.change === '강화' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                          ) : change.change === '약화' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center mr-2">
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            </div>
                          )}
                          <div className="font-semibold text-gray-800">
                            {change.category} 
                            <span className={`ml-1 ${change.change === '강화' ? 'text-green-500' : change.change === '약화' ? 'text-red-500' : 'text-gray-500'}`}>
                              ({change.change})
                            </span>
                          </div>
                        </div>
                      </div>
                      <ScentInfoToggle 
                        title="AI의 변화 이유 확인하기" 
                        content={change.reason} 
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <TestingRecipeSection recipe={recipe} feedback={feedback} />
          
          {recipe.testingRecipe && recipe.testingRecipe.granules.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200 shadow-lg">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-orange-200">
                <h4 className="font-bold text-orange-800 text-lg flex items-center">
                  <span className="text-xl mr-2">📊</span> 향료 구성 비율
                </h4>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100 mb-4">
                <p className="text-gray-700 mb-4 text-center">각 향료가 전체 레시피에서 차지하는 비율을 시각적으로 확인하세요.</p>
                <div className="w-full md:w-2/3 lg:w-1/2 aspect-square max-w-[300px] mx-auto">
                  <Doughnut 
                    data={doughnutChartData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: true, 
                      plugins: { 
                        legend: { 
                          display: true, 
                          position: 'bottom', 
                          labels: { 
                            usePointStyle: true, 
                            boxWidth: 8, 
                            padding: 15, 
                            color: '#4B5563', 
                            font: { size: 11 } 
                          } 
                        } 
                      },
                      animation: {
                        animateScale: true,
                        animateRotate: true
                      },
                      cutout: '60%'
                    }} 
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                {processedGranulesForDonut.map((granule, index) => (
                  <div key={granule.id} className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index % 5] }}></div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">{granule.name}</p>
                      </div>
                      <div className="text-sm font-medium text-orange-600">{granule.percentage}%</div>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 mr-2">{granule.id}</span>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        {granule.mainCategory || "일반"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center mt-8 space-y-4 w-full px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetForm}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md flex items-center justify-center font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              다시 피드백 기록하기
            </motion.button>
            {!isRecipeConfirmed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmRecipe}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-md flex items-center justify-center font-medium"
              >
                <span className="mr-2">레시피 확정하기</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            피드백이 성공적으로 제출되었습니다!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            소중한 의견 감사합니다. 고객님의 피드백은 향수 추천 품질 향상에 큰 도움이 됩니다.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md"
          >
            닫기
          </motion.button>
        </div>
      )}
    </div>
  );
};