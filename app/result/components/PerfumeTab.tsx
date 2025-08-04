import React from 'react';
import { motion } from 'framer-motion';
import { ImageAnalysisResult } from '@/app/types/perfume';
import { PerfumeNotes } from './PerfumeNotes';
import { PerfumeProfile } from './PerfumeProfile';
import { PerfumeRecommendations } from './PerfumeRecommendations';
import { PerfumeUsageGuide } from './PerfumeUsageGuide';

interface PerfumeTabProps {
  displayedAnalysis: ImageAnalysisResult;
  currentLanguage: string;
  t: (key: string) => string;
}

export const PerfumeTab: React.FC<PerfumeTabProps> = ({ displayedAnalysis, currentLanguage, t }) => {
  return (
    <motion.div 
      key="perfume"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {displayedAnalysis.matchingPerfumes && displayedAnalysis.matchingPerfumes.length > 0 ? (
        <>
          {/* 매칭된 향수 정보 */}
          {displayedAnalysis.matchingPerfumes.map((match, index) => (
            <div key={index} className="mb-6">
              <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
                {/* 향수 정보 헤더 */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 border-b border-yellow-200">
                  <div className="flex justify-between items-start">
                    {/* 향수 코드 + 이름 섹션 */}
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-700 mb-1 border-b-2 border-amber-300 inline-block pb-1">
                        {match.persona?.id || t('result.perfume.customPerfume')}
                      </h2>
                      <p className="text-sm text-gray-700">
                        {match.persona?.name || ''}
                      </p>
                    </div>
                    
                    {/* 매칭 정확도 */}
                    <div className="relative h-16 w-16 flex flex-col items-center justify-center">
                      <svg className="h-full w-full" viewBox="0 0 36 36">
                        <circle 
                          cx="18" cy="18" r="15.91549431" 
                          fill="none" 
                          stroke="#e9e9e9" 
                          strokeWidth="1"
                        />
                        <circle 
                          cx="18" cy="18" r="15.91549431" 
                          fill="none" 
                          stroke={
                            match.score >= 0.9 ? "#22c55e" : 
                            match.score >= 0.8 ? "#3b82f6" :
                            match.score >= 0.7 ? "#a855f7" : "#d97706"
                          }
                          strokeWidth="3"
                          strokeDasharray={`${Math.round(match.score * 100)} 100`}
                          strokeDashoffset="25"
                          strokeLinecap="round"
                        />
                        <text x="18" y="18.5" textAnchor="middle" dominantBaseline="middle" 
                          className="text-xs font-bold" fill="#374151">
                          {Math.round(match.score * 100)}%
                        </text>
                      </svg>
                      <span className="text-[10px] text-gray-700 mt-1">매칭도</span>
                    </div>
                  </div>
                </div>
                
                {/* 향수 내용 */}
                <div className="p-4 space-y-6">
                  {/* 향 노트 설명 */}
                  <PerfumeNotes 
                    persona={match.persona} 
                    currentLanguage={currentLanguage} 
                    t={t} 
                  />

                  {/* 향수 특성 시각화 */}
                  <PerfumeProfile 
                    persona={match.persona} 
                    currentLanguage={currentLanguage} 
                    t={t} 
                  />

                  {/* 향수 매칭 이유 및 설명 */}
                  {match.matchReason && (
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
                        <span className="mr-2">✨</span>
                        <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.perfumeStory')}</span>
                      </h3>
                      
                      {/* 매칭 이유 섹션 - 상세 파싱 */}
                      {(() => {
                        try {
                          // matchReason을 줄바꿈으로 분리하여 섹션 파싱
                          const sections = match.matchReason.split('\n\n');
                          const introduction = sections[0] || '';
                          const matchingReason = sections.length > 2 ? sections[2] : '';
                          const usageRecommendation = sections.length > 3 ? sections[3] : '';
                          
                          return (
                            <div className="space-y-3">
                              {/* 소개 */}
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
                                <div className="flex">
                                  <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                                    <span className="text-xl text-white">💬</span>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-amber-900 mb-1">{t('result.perfume.expertEvaluation')}</h4>
                                    <p className="text-sm italic text-amber-800">{introduction}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 매칭 이유 */}
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
                                <h4 className="flex items-center text-sm font-bold text-indigo-900 mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-1">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                  </svg>
                                  {t('result.image.perfume.matching')}
                                </h4>
                                <p className="text-sm text-indigo-800 italic bg-white bg-opacity-60 p-3 rounded-lg border border-indigo-100">
                                  {matchingReason}
                                </p>
                              </div>
                              
                              {/* 사용 추천 */}
                              <div className="grid grid-cols-1 gap-3">
                                <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                                  <h4 className="flex items-center text-sm font-bold text-amber-900 mb-2">
                                    <span className="mr-2">🕒</span>
                                    {t('result.perfume.usageRecommendation')}
                                  </h4>
                                  <p className="text-sm text-amber-800">{usageRecommendation}</p>
                                </div>
                                
                                {/* 계절 및 시간 추천 - 시각화 */}
                                <PerfumeRecommendations 
                                  persona={match.persona} 
                                  currentLanguage={currentLanguage} 
                                  t={t} 
                                />
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error('매칭 이유 파싱 오류:', error);
                          return (
                            <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                              <p className="text-sm text-amber-800 italic">{match.matchReason}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                  
                  {/* 향수 사용 가이드 */}
                  <PerfumeUsageGuide t={t} />
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-gray-700 text-center">{t('result.perfume.noMatch')}</p>
        </div>
      )}
    </motion.div>
  );
};