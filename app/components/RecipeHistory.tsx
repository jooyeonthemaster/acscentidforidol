'use client';

import React, { useState, useEffect } from 'react';
import { RecipeHistoryItem, RecipeHistoryResponse, RecipeActionResponse, TestingGranule } from '../types/perfume';

interface RecipeHistoryProps {
  userId: string;
  sessionId: string;
  currentRecipe?: RecipeHistoryItem;
  onRecipeSelect?: (recipe: RecipeHistoryItem) => void;
  onRecipeActivate?: (recipe: RecipeHistoryItem) => void;
  className?: string;
}

const RecipeHistory: React.FC<RecipeHistoryProps> = ({
  userId,
  sessionId,
  currentRecipe,
  onRecipeSelect,
  onRecipeActivate,
  className = ''
}) => {
  const [recipes, setRecipes] = useState<RecipeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeHistoryItem | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [activatingRecipe, setActivatingRecipe] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState<RecipeHistoryItem | null>(null);

  // 레시피 히스토리 조회
  const fetchRecipeHistory = async () => {
    if (!userId || !sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/recipe-history?userId=${userId}&sessionId=${sessionId}`
      );
      
      if (!response.ok) {
        throw new Error('레시피 히스토리 조회 실패');
      }

      const data: RecipeHistoryResponse = await response.json();
      
      if (data.success) {
        setRecipes(data.recipes);
      } else {
        setError(data.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 레시피 북마크 토글
  const toggleBookmark = async (recipeId: string, isBookmarked: boolean) => {
    try {
      const response = await fetch('/api/recipe-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bookmark',
          userId,
          recipeId,
          isBookmarked: !isBookmarked
        })
      });

      const data: RecipeActionResponse = await response.json();
      
      if (data.success) {
        setRecipes(prev => prev.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, isBookmarked: data.isBookmarked }
            : recipe
        ));
      } else {
        alert('북마크 업데이트에 실패했습니다.');
      }
    } catch (err) {
      alert('북마크 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 레시피 활성화
  const activateRecipe = async (recipe: RecipeHistoryItem) => {
    setActivatingRecipe(recipe.id);
    
    try {
      const response = await fetch('/api/recipe-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activate',
          userId,
          sessionId,
          recipeData: recipe
        })
      });

      const data: RecipeActionResponse = await response.json();
      
      if (data.success) {
        onRecipeActivate?.(recipe);
        alert(data.message);
      } else {
        alert('레시피 활성화에 실패했습니다.');
      }
    } catch (err) {
      alert('레시피 활성화 중 오류가 발생했습니다.');
    } finally {
      setActivatingRecipe(null);
    }
  };

  // 레시피 선택
  const handleRecipeSelect = (recipe: RecipeHistoryItem) => {
    setSelectedRecipe(recipe);
    onRecipeSelect?.(recipe);
  };

  // 레시피 상세 보기
  const showRecipeDetail = (recipe: RecipeHistoryItem) => {
    setDetailRecipe(recipe);
    setShowDetailModal(true);
  };

  // 레시피 비교 기능
  const compareRecipes = () => {
    if (!currentRecipe || !selectedRecipe) return null;

    const currentGranules = currentRecipe.improvedRecipe?.testingRecipe?.granules || [];
    const selectedGranules = selectedRecipe.improvedRecipe?.testingRecipe?.granules || [];

    return {
      current: currentRecipe,
      selected: selectedRecipe,
      differences: {
        granules: {
          added: selectedGranules.filter(sg => 
            !currentGranules.find(cg => cg.id === sg.id)
          ),
          removed: currentGranules.filter(cg => 
            !selectedGranules.find(sg => sg.id === cg.id)
          ),
          modified: selectedGranules.filter(sg => {
            const currentGranule = currentGranules.find(cg => cg.id === sg.id);
            return currentGranule && (
              currentGranule.drops !== sg.drops || 
              currentGranule.ratio !== sg.ratio
            );
          })
        },
        ratioChanges: []
      }
    };
  };

  useEffect(() => {
    fetchRecipeHistory();
  }, [userId, sessionId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGranulesList = (granules: TestingGranule[]) => (
    <div className="flex flex-wrap gap-1 mt-2">
      {granules.map((granule, index) => (
        <span
          key={index}
          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          {granule.name} ({granule.drops}방울)
        </span>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">레시피 히스토리 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ 오류 발생</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecipeHistory}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            📝 레시피 히스토리
          </h3>
          <span className="text-sm text-gray-500">
            총 {recipes.length}개의 레시피
          </span>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <p className="text-gray-500">아직 생성된 레시피가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              피드백을 통해 첫 번째 레시피를 만들어보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedRecipe?.id === recipe.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleRecipeSelect(recipe)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        레시피 #{recipes.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(recipe.createdAt)}
                      </span>
                      {recipe.isBookmarked && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                      {recipe.selectedFromHistory && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          활성화됨
                        </span>
                      )}
                    </div>

                    {recipe.improvedRecipe?.originalPerfumeName && (
                      <p className="text-sm text-gray-600 mb-2">
                        기반: {recipe.improvedRecipe.originalPerfumeName}
                      </p>
                    )}

                    {recipe.improvedRecipe?.testingRecipe?.granules && (
                      <div>
                        <p className="text-sm text-gray-700 mb-1">
                          향료 {recipe.improvedRecipe.testingRecipe.granules.length}개
                        </p>
                        {renderGranulesList(recipe.improvedRecipe.testingRecipe.granules)}
                      </div>
                    )}

                    {recipe.improvedRecipe?.overallExplanation && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {recipe.improvedRecipe.overallExplanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showRecipeDetail(recipe);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                      title="레시피 상세 정보 보기"
                    >
                      상세 보기
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(recipe.id, recipe.isBookmarked || false);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        recipe.isBookmarked
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={recipe.isBookmarked ? '북마크 제거' : '북마크 추가'}
                    >
                      ⭐
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        activateRecipe(recipe);
                      }}
                      disabled={activatingRecipe === recipe.id}
                      className="px-3 py-1 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="이 레시피를 현재 레시피로 설정"
                    >
                      {activatingRecipe === recipe.id ? '설정 중...' : '활성화'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {selectedRecipe && currentRecipe && selectedRecipe.id !== currentRecipe.id && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">🔄 레시피 비교</h4>
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>현재:</strong> {currentRecipe.improvedRecipe?.originalPerfumeName || '현재 레시피'}
                  </p>
                  <p className="mb-3">
                    <strong>선택:</strong> {selectedRecipe.improvedRecipe?.originalPerfumeName || '선택한 레시피'}
                  </p>
                  
                  {(() => {
                    const comparison = compareRecipes();
                    if (!comparison) return null;
                    
                    return (
                      <div className="space-y-2">
                        {comparison.differences.granules.added.length > 0 && (
                          <p>
                            <span className="text-green-600">추가된 향료:</span> {
                              comparison.differences.granules.added.map(g => g.name).join(', ')
                            }
                          </p>
                        )}
                        {comparison.differences.granules.removed.length > 0 && (
                          <p>
                            <span className="text-red-600">제거된 향료:</span> {
                              comparison.differences.granules.removed.map(g => g.name).join(', ')
                            }
                          </p>
                        )}
                        {comparison.differences.granules.modified.length > 0 && (
                          <p>
                            <span className="text-orange-600">변경된 향료:</span> {
                              comparison.differences.granules.modified.map(g => g.name).join(', ')
                            }
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 레시피 상세 모달 */}
      {showDetailModal && detailRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-3">⚗️</span>
                향료 정보
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              {/* 향료 조합 */}
              {detailRecipe.improvedRecipe?.testingRecipe?.granules && detailRecipe.improvedRecipe.testingRecipe.granules.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">🧪 향료 조합</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid gap-3">
                      {detailRecipe.improvedRecipe.testingRecipe.granules.map((granule: any, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">{granule.name}</p>
                            <p className="text-sm text-gray-600">({granule.id})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{(granule.drops * 0.1).toFixed(1)}g</p>
                            <p className="text-sm text-gray-600">{granule.drops}방울</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 총 무게 */}
                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800 text-lg">총 무게:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {(detailRecipe.improvedRecipe.testingRecipe.granules.reduce((sum: number, g: any) => sum + g.drops, 0) * 0.1).toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">🚨 향료 정보 없음</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600">이 레시피에는 향료 정보가 없습니다.</p>
                  </div>
                </div>
              )}

              {/* 버튼들 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    activateRecipe(detailRecipe);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium"
                >
                  이 레시피 활성화
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeHistory; 