"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Doughnut } from 'react-chartjs-2';
import { GeminiPerfumeSuggestion, PerfumeFeedback, PerfumePersona, CategoryDataPoint, TestingGranule, RecipeHistoryItem } from '@/app/types/perfume';
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
import RecipeHistory from '../../RecipeHistory';

interface SuccessViewProps {
  feedback: PerfumeFeedback;
  recipe: GeminiPerfumeSuggestion | null;
  originalPerfume: PerfumePersona;
  customizationLoading: boolean;
  onClose: () => void;
  onResetForm?: () => void;
  userId?: string;
  sessionId?: string;
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
  onResetForm,
  userId,
  sessionId
}) => {
  const [isRecipeConfirmed, setIsRecipeConfirmed] = useState(false);
  const [confirmedRecipeDetails, setConfirmedRecipeDetails] = useState<ConfirmedRecipeDetail[]>([]);
  const [showCategoryChanges, setShowCategoryChanges] = useState(false);
  const [showRecipeHistory, setShowRecipeHistory] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<RecipeHistoryItem | undefined>(undefined);

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

  // 레시피 선택 핸들러
  const handleRecipeSelect = (recipe: RecipeHistoryItem) => {
    console.log('레시피 선택됨:', recipe);
  };

  // 레시피 활성화 핸들러
  const handleRecipeActivate = (recipe: RecipeHistoryItem) => {
    setCurrentRecipe(recipe);
    setShowRecipeHistory(false);
    alert(`${recipe.originalPerfumeName || '레시피'}가 활성화되었습니다!`);
  };

  if (isRecipeConfirmed) {
    return (
      <div className="py-8 flex flex-col items-center text-center bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 min-h-screen">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full p-3 shadow-2xl border-4 border-white/50 backdrop-blur-sm" 
        >
          <Image src="/cute2.png" alt="Cute Character Happy" width={112} height={112} className="object-contain drop-shadow-lg" />
        </motion.div>
        <h3 className="text-2xl font-bold text-emerald-600 mb-2">🎉 조향 레시피 확정! 🎉</h3>
        <p className="text-gray-600 mb-8 text-sm max-w-md">아래 레시피에 따라 향료를 첨가하여 나만의 향수를 만들어보세요!</p>

        <div className="w-full max-w-md mx-auto space-y-6 px-4">
          {/* 10ml 향수 레시피 */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300 hover:transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-400/10 to-teal-400/10 rounded-3xl"></div>
            <div className="relative">
              <h4 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                <span className="text-2xl mr-3 drop-shadow-sm">💧</span>10ml 향수 만들기 (총 향료: 1g)
              </h4>
              <ul className="space-y-3 text-left">
                {confirmedRecipeDetails.map((item, index) => (
                  <li key={`10ml-${item.id}-${index}`} className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300 border border-emerald-100/50 shadow-sm">
                    <span className="text-sm text-gray-700 font-medium">{item.name} ({item.id})</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full">{item.amount10ml} g</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 50ml 향수 레시피 */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 hover:shadow-3xl transition-all duration-300 hover:transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-400/10 to-teal-400/10 rounded-3xl"></div>
            <div className="relative">
              <h4 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                <span className="text-2xl mr-3 drop-shadow-sm">🧪</span>50ml 향수 만들기 (총 향료: 5g)
              </h4>
              <ul className="space-y-3 text-left">
                {confirmedRecipeDetails.map((item, index) => (
                  <li key={`50ml-${item.id}-${index}`} className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl hover:from-emerald-100 hover:to-green-100 transition-all duration-300 border border-emerald-100/50 shadow-sm">
                    <span className="text-sm text-gray-700 font-medium">{item.name} ({item.id})</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-full">{item.amount50ml} g</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-12 space-y-5 w-full px-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetForm}
            className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
          >
            새로운 피드백 작성
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
          >
            닫기
          </motion.button>
        </div>
      </div>
    );
  }

  if (recipe?.isFinalRecipe && !recipe.testingRecipe) {
    return (
      <div className="py-8 flex flex-col items-center text-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center mb-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full p-3 shadow-2xl border-4 border-white/50 backdrop-blur-sm" 
        >
          <Image src="/cute2.png" alt="Cute Character Happy" width={112} height={112} className="object-contain drop-shadow-lg" />
        </motion.div>
        <h3 className="text-2xl font-bold text-emerald-600 mb-4">🎉 레시피 확정!</h3>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 max-w-md mx-4 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-400/10 to-blue-400/10 rounded-3xl"></div>
          <div className="relative">
            <p className="text-gray-700 mb-4 leading-relaxed">
              {recipe.overallExplanation || `${recipe.originalPerfumeName} 향을 100% 유지하는 것을 선택하셨습니다. 추가 조정 없이 원본의 매력을 그대로 즐기실 수 있습니다.`}
            </p>
            {recipe.finalRecipeDetails?.description && (
              <p className="text-sm text-gray-600 mt-4 mb-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100/50">{recipe.finalRecipeDetails.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center mt-10 space-y-5 w-full px-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetForm}
            className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            다시 피드백 기록하기
          </motion.button>
          {!isRecipeConfirmed && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmRecipe}
              className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
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
    <>
    <div className="py-5 flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="relative flex flex-col items-center mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 max-w-xs text-center mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl"></div>
          <p className="relative text-base md:text-lg font-semibold text-white drop-shadow-sm">
            ✨ 맞춤 향수 레시피가 준비되었습니다!
          </p>
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-3 w-0 h-0"
            style={{
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderTop: '15px solid rgb(168 85 247)',
            }}
          ></div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 150, damping: 15 }}
          className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 shadow-xl border-4 border-white/50 backdrop-blur-sm" 
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
            <Image src="/cute2.png" alt="Cute Character Surprised" width={112} height={112} className="object-contain drop-shadow-lg" />
          </motion.div>
        </motion.div>
      </div>
      
      {customizationLoading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 mx-4">
          <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-6 drop-shadow-lg"></div>
          <p className="text-indigo-600 font-bold text-lg">맞춤 향수 레시피 생성 중...</p>
          <p className="text-sm text-gray-500 mt-3 max-w-xs text-center">잠시만 기다려주세요. 고객님의 피드백을 반영한 맞춤형 향수 레시피를 준비하고 있습니다. 최대 15초 정도 소요됩니다.</p>
        </div>
      ) : recipe ? (
        <div className="mt-6 space-y-8 px-4">
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:transform hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gradient-to-r from-transparent via-indigo-200 to-transparent">
                <h4 className="font-bold text-indigo-800 text-lg flex items-center">
                  <span className="text-2xl mr-3 drop-shadow-sm">🔍</span> 피드백 반영 결과
                </h4>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-4 py-2 text-xs font-medium shadow-lg border border-white/20">
                  원본 향 {recipe.retentionPercentage}% 유지
                </div>
              </div>
              
              {recipe.contradictionWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200/50 shadow-lg backdrop-blur-sm flex items-start hover:shadow-xl transition-shadow duration-300">
                    <span className="text-2xl text-amber-500 mr-4 drop-shadow-sm">⚠️</span>
                    <div>
                      <p className="font-semibold text-amber-700 mb-2">피드백 모순 알림</p>
                      <p className="text-sm text-amber-600">{recipe.contradictionWarning.message}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {recipe.overallExplanation && (
                <div className="mb-8 p-6 bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <p className="font-semibold text-indigo-800 mb-3 flex items-center">
                    <span className="text-xl mr-3 drop-shadow-sm">💡</span> AI의 종합 의견
                  </p>
                  <p className="text-gray-700 leading-relaxed">{recipe.overallExplanation}</p>
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">기존 향 유지 비율</p>
                  <p className="text-sm font-bold text-indigo-600">{recipe.retentionPercentage}%</p>
                </div>
                <div className="w-full h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${recipe.retentionPercentage}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-full shadow-lg"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)' }}
                  ></motion.div>
                </div>
              </div>
              
              <div className="relative mx-auto w-full max-w-lg h-[380px] sm:h-[400px] md:h-[450px] mb-8 bg-gradient-to-br from-white to-indigo-50/30 p-6 rounded-2xl shadow-xl border border-indigo-100/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <p className="font-semibold text-indigo-800 mb-4 flex items-center justify-center">
                  <span className="text-xl mr-3 drop-shadow-sm">📊</span> 향 프로필 변화
                </p>
                <CategoryChangeRadar feedback={feedback} recipe={recipe} originalPerfume={originalPerfume} />
              </div>
              
              {recipe.categoryChanges && recipe.categoryChanges.length > 0 && (
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCategoryChanges(!showCategoryChanges)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50 shadow-sm hover:shadow-md transition-all duration-300 hover:from-indigo-100 hover:to-purple-100"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3 drop-shadow-sm">🔄</span>
                      <span className="font-semibold text-indigo-800">주요 카테고리 변화</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showCategoryChanges ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.button>
                  
                  {showCategoryChanges && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 flex flex-col space-y-4"
                    >
                      {recipe.categoryChanges.map((change, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * idx, duration: 0.4 }}
                          className="bg-gradient-to-r from-white to-indigo-50/30 rounded-2xl p-3 border border-indigo-100/30 shadow-lg backdrop-blur-sm hover:shadow-xl hover:transform hover:scale-[1.02] transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {change.change === '강화' ? (
                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6.342a3.375 3.375 0 01.621-1.956C3.142 3.667 3.731 3 4.5 3h11c.769 0 1.358.667 1.879 1.386.33.458.621 1.07.621 1.956v.637c0 .789-.183 1.55-.5 2.25A10.73 10.73 0 0115 11c-1.85 0-3.615-.429-5.18-1.195A12.84 12.84 0 008.5 9c-1.85 0-3.615.429-5.18 1.195A3.94 3.94 0 012 9.979V6.342z"/>
                                    <path d="M14.5 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                    <path d="M2 14.342V13a1 1 0 011-1h.5c.691 0 1.388.183 2.053.53A11.907 11.907 0 018.5 13c1.85 0 3.615-.429 5.18-1.195A3.94 3.94 0 0115 11h.5a1 1 0 011 1v1.342c0 .789-.183 1.55-.5 2.25A10.73 10.73 0 0115 17c-1.85 0-3.615-.429-5.18-1.195A12.84 12.84 0 008.5 15c-1.85 0-3.615.429-5.18 1.195A3.94 3.94 0 012 15.658V14.342z"/>
                                  </svg>
                                </div>
                              ) : change.change === '약화' ? (
                                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-rose-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                                    <path d="M2 6.342a3.375 3.375 0 01.621-1.956C3.142 3.667 3.731 3 4.5 3h11c.769 0 1.358.667 1.879 1.386.33.458.621 1.07.621 1.956v.637c0 .789-.183 1.55-.5 2.25A10.73 10.73 0 0115 11c-1.85 0-3.615-.429-5.18-1.195A12.84 12.84 0 008.5 9c-1.85 0-3.615.429-5.18 1.195A3.94 3.94 0 012 9.979V6.342z"/>
                                    <path d="M14.5 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                    <path d="M2 14.342V13a1 1 0 011-1h.5c.691 0 1.388.183 2.053.53A11.907 11.907 0 018.5 13c1.85 0 3.615-.429 5.18-1.195A3.94 3.94 0 0115 11h.5a1 1 0 011 1v1.342c0 .789-.183 1.55-.5 2.25A10.73 10.73 0 0115 17c-1.85 0-3.615-.429-5.18-1.195A12.84 12.84 0 008.5 15c-1.85 0-3.615.429-5.18 1.195A3.94 3.94 0 012 15.658V14.342z"/>
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                  <div className="w-3 h-3 rounded-full bg-white"></div>
                                </div>
                              )}
                              <div className="font-semibold text-gray-800">
                                {change.category}
                              </div>
                            </div>
                          </div>
                          <ScentInfoToggle 
                            title="AI의 변화 이유 확인하기" 
                            content={change.reason} 
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <TestingRecipeSection recipe={recipe} feedback={feedback} />
          
          {recipe.testingRecipe && recipe.testingRecipe.granules.length > 0 && (
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:transform hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-orange-400/10 to-pink-400/10 rounded-3xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gradient-to-r from-transparent via-amber-200 to-transparent">
                  <h4 className="font-bold text-amber-800 text-lg flex items-center">
                    <span className="text-2xl mr-3 drop-shadow-sm">📊</span> 향료 구성 비율
                  </h4>
                </div>
                
                <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-6 shadow-lg border border-amber-100/30 backdrop-blur-sm mb-6 hover:shadow-xl transition-shadow duration-300">
                  <p className="text-gray-700 mb-6 text-center leading-relaxed">각 향료가 전체 레시피에서 차지하는 비율을 시각적으로 확인하세요.</p>
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
                
                <div className="flex flex-col space-y-4">
                  {processedGranulesForDonut.map((granule, index) => (
                    <div key={granule.id} className="bg-gradient-to-r from-white to-amber-50/30 rounded-2xl p-4 border border-amber-100/30 shadow-lg backdrop-blur-sm hover:shadow-xl hover:transform hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-4 h-4 rounded-full mr-3 shadow-sm border border-white/50" 
                          style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[index % 5] }}
                        ></div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-800">{granule.name}</p>
                        </div>
                        <div className="text-sm font-medium text-amber-600 bg-amber-100/50 px-2 py-1 rounded-full">
                          {granule.percentage}%
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500 mr-3 bg-gray-100 px-2 py-1 rounded-full">{granule.id}</span>
                        <span className="text-xs px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full border border-amber-200/50 shadow-sm">
                          {granule.mainCategory || "일반"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center mt-10 space-y-5 w-full px-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRecipeHistory(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              📚 이전 레시피 보기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetForm}
              className="w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              다시 피드백 기록하기
            </motion.button>
            {!isRecipeConfirmed && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirmRecipe}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-center font-medium"
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
        <div className="relative text-center py-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mx-4 hover:shadow-3xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-green-400/10 to-teal-400/10 rounded-3xl"></div>
          <div className="relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-6 shadow-xl border-4 border-white/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              피드백이 성공적으로 제출되었습니다!
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
              소중한 의견 감사합니다. 고객님의 피드백은 향수 추천 품질 향상에 큰 도움이 됩니다.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 font-medium"
            >
              닫기
            </motion.button>
          </div>
        </div>
      )}
    </div>

    {/* 레시피 히스토리 모달 */}
    {showRecipeHistory && userId && sessionId && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-3">📚</span>
              이전 레시피 히스토리
            </h3>
            <button
              onClick={() => setShowRecipeHistory(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모달 내용 */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* 현재 활성화된 레시피 표시 */}
            {currentRecipe && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">🎯 현재 활성화된 레시피</h4>
                <p className="text-sm text-green-700">
                  <strong>{currentRecipe.originalPerfumeName || '이전 레시피'}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {currentRecipe.testingRecipe?.granules?.length || 0}개 향료 조합
                </p>
              </div>
            )}

            <RecipeHistory
              userId={userId!}
              sessionId={sessionId!}
              currentRecipe={currentRecipe}
              onRecipeSelect={handleRecipeSelect}
              onRecipeActivate={handleRecipeActivate}
              className="max-h-full"
            />
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
};