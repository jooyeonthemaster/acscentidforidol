import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CustomPerfumeRecipe, PerfumeFeedback, ScentMixture, ScentCategoryScores, PerfumeCategory, GeminiPerfumeSuggestion } from '@/app/types/perfume';
import perfumePersonasData from '@/app/data/perfumePersonas';
import GranuleIcon from './GranuleIcon';
import ScentInfoToggle from './ScentInfoToggle';
import { formatScentCode } from '../utils/formatters';
import { getScentCategoryPrefix, getScentMainCategory, getCategoryColor } from '../utils/scentUtils';

interface TestingRecipeSectionProps {
  recipe: GeminiPerfumeSuggestion | null;
  feedback: PerfumeFeedback;
}

const TestingRecipeSection: React.FC<TestingRecipeSectionProps> = ({ recipe, feedback }) => {
  if (!recipe || !recipe.testingRecipe || recipe.testingRecipe.granules.length === 0) {
    if (recipe?.isFinalRecipe && recipe.finalRecipeDetails) {
      // 100% 유지 시나리오: 테스팅 레시피 대신 최종 레시피 정보를 간략히 표시하거나 안내 문구
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg">
          <h4 className="font-semibold text-green-800 mb-4 flex items-center text-lg">
            <span className="text-xl mr-2">🌿</span> 최종 레시피 안내
          </h4>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <p className="text-gray-700 mb-3">
              {recipe.overallExplanation || '기존 향을 100% 유지하는 레시피입니다. 별도의 시향 테스트 없이 바로 제작 단계로 넘어갈 수 있습니다.'}
            </p>
            {/* 필요시 recipe.finalRecipeDetails의 내용 일부 표시 */}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-lg">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center text-lg">
          <span className="text-xl mr-2">🧪</span> 필요한 향료 방울
        </h4>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-center h-32">
          <p className="text-gray-600">AI 추천 테스팅 레시피를 불러오는 중이거나, 제안된 레시피가 없습니다.</p>
        </div>
      </div>
    );
  }

  const { granules, instructions, purpose } = recipe.testingRecipe;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg">
      {/* 상단 타이틀 및 목적 */}
      <div className="flex items-center justify-between mb-5 border-b border-purple-200 pb-4">
        <h4 className="font-bold text-purple-800 flex items-center text-lg">
          <span className="text-xl mr-2">🧪</span> 테스팅 레시피
        </h4>
        <div className="bg-white rounded-full px-3 py-1 shadow-sm border border-purple-100 text-xs text-purple-600 font-medium">
          총 {granules.reduce((acc, g) => acc + g.drops, 0)}방울
        </div>
      </div>

      {/* 테스팅 목적 섹션 */}
      {purpose && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-5"
        >
          <div className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm">
            <h5 className="font-semibold text-purple-700 mb-2 text-sm flex items-center">
              <span className="text-md mr-2">🎯</span> 테스팅 목적
            </h5>
            <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-md">{purpose}</p>
          </div>
        </motion.div>
      )}
      
      {/* 경고 메시지 */}
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
              <p className="font-semibold text-yellow-700 mb-1">주의: 피드백 모순 감지</p>
              <p className="text-sm text-yellow-600">{recipe.contradictionWarning.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 필요한 향료 방울 섹션 */}
      <div className="mb-6">
        <h5 className="font-semibold text-purple-800 mb-3 text-base flex items-center">
          <span className="text-lg mr-2">💧</span> 필요한 향료 방울
        </h5>
        
        <div className="flex flex-col space-y-4">
          {granules.map((granule, index) => (
            <motion.div 
              key={granule.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="bg-white rounded-lg p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="relative">
                    <GranuleIcon 
                      index={index}
                      scentName={granule.name}
                      category={granule.mainCategory as string}
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-800">{granule.name}</span>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 mr-2">{granule.id}</p>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        {granule.mainCategory || getScentMainCategory(granule.id) || "일반"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-100 rounded-full px-3 py-1 flex items-center">
                  <span className="text-xs font-bold text-purple-600">{granule.drops}</span>
                  <span className="text-xs text-purple-500 ml-1">방울</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>비율</span>
                  <span className="font-medium text-purple-600">{granule.ratio}%</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"
                    style={{ width: `${granule.ratio}%` }}
                  >
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <ScentInfoToggle 
                  title="AI의 추천 이유 확인하기" 
                  content={granule.reason} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* 테스팅 단계 안내 섹션 */}
      <div className="bg-white rounded-lg p-5 border border-purple-100 shadow-sm">
        <h5 className="font-semibold text-purple-700 mb-4 text-base flex items-center">
          <span className="text-lg mr-2">📝</span> 테스트 방법
        </h5>
        
        <div className="space-y-6">
          {/* 단계 1 */}
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shadow-sm">1</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 mb-1">{instructions.step1.title}</p>
              <p className="text-gray-600 text-sm">{instructions.step1.description}</p>
              <p className="text-gray-500 mt-2 text-xs bg-purple-50 p-2 rounded-md"><em>{instructions.step1.details}</em></p>
            </div>
          </div>
          
          {/* 단계 사이 연결선 */}
          <div className="flex">
            <div className="mr-4 flex-shrink-0 flex justify-center">
              <div className="w-0.5 h-6 bg-purple-200"></div>
            </div>
          </div>
          
          {/* 단계 2 */}
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shadow-sm">2</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 mb-1">{instructions.step2.title}</p>
              <p className="text-gray-600 text-sm">{instructions.step2.description}</p>
              <p className="text-gray-500 mt-2 text-xs bg-purple-50 p-2 rounded-md"><em>{instructions.step2.details}</em></p>
            </div>
          </div>
          
          {/* 단계 사이 연결선 */}
          <div className="flex">
            <div className="mr-4 flex-shrink-0 flex justify-center">
              <div className="w-0.5 h-6 bg-purple-200"></div>
            </div>
          </div>
          
          {/* 단계 3 */}
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shadow-sm">3</div>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-800 mb-1">{instructions.step3.title}</p>
              <p className="text-gray-600 text-sm">{instructions.step3.description}</p>
              <p className="text-gray-500 mt-2 text-xs bg-purple-50 p-2 rounded-md"><em>{instructions.step3.details}</em></p>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="mt-6 pt-5 border-t border-dashed border-purple-200">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <h6 className="font-semibold text-yellow-700 mb-2 text-sm flex items-center">
              <span className="text-lg mr-2">⚠️</span> 테스팅 주의사항
            </h6>
            <p className="text-sm text-yellow-600 whitespace-pre-wrap">{instructions.caution}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingRecipeSection; 