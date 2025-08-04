import React from 'react';
import { motion } from 'framer-motion';
import { ImageAnalysisResult } from '@/app/types/perfume';
import TraitRadarChart from '@/components/chart/TraitRadarChart';
import KeywordCloud from '@/components/chart/KeywordCloud';

interface AnalysisTabProps {
  displayedAnalysis: ImageAnalysisResult;
  t: (key: string) => string;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ displayedAnalysis, t }) => {
  return (
    <motion.div 
      key="analysis"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* 분석 요약 */}
      {displayedAnalysis.analysis && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.mood')}</span>
            <span className="ml-2 text-xs text-yellow-700">{t('result.analysis.aiThought')}</span>
          </h3>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200 shadow-inner">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white">
                  <span className="text-xl">💭</span>
                </div>
              </div>
              <p className="text-gray-900 text-sm font-medium italic">"{displayedAnalysis.analysis.mood}"</p>
            </div>
            <div className="mt-4 text-right">
              <span className="inline-block bg-white px-3 py-1 rounded-full text-xs text-amber-800 font-medium border border-amber-200">
                @acscent_ai
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* 특성 점수 - 레이더 차트 */}
      <div className="mb-16">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
          <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.traits')}</span>
          <span className="ml-2 text-xs text-pink-700">{t('result.analysis.core')}</span>
        </h3>
        
        <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm mb-4">
          {displayedAnalysis.traits && (
            <div className="flex justify-center">
              <div className="w-full min-h-[380px] h-auto relative mb-6">
                <TraitRadarChart traits={displayedAnalysis.traits} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 스타일 분석 */}
      {displayedAnalysis.analysis && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.style')}</span>
            <span className="ml-2 text-xs text-green-700">{t('result.analysis.styleExplanation')}</span>
          </h3>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 gap-3">
              {displayedAnalysis.analysis.style && (
                <div className="bg-white rounded-lg p-4 border-l-4 border-pink-400 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="rounded-full bg-pink-100 p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-pink-600">
                        <circle cx="12" cy="7" r="4"></circle>
                        <path d="M5 21V19a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-pink-800 mb-1">{t('result.analysis.style')}</h4>
                      <p className="text-gray-800 text-sm italic">
                        {displayedAnalysis.analysis?.style || t('result.analysis.styleDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {displayedAnalysis.analysis.expression && (
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="rounded-full bg-purple-100 p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-600">
                        <path d="M12 2c.5 0 1 .2 1.2.6l7.5 13.5c.3.5.3 1 .1 1.4-.2.5-.7.7-1.2.7H4.4c-.5 0-1-.2-1.2-.7-.2-.5-.2-1 .1-1.4L10.8 2.6c.2-.4.7-.6 1.2-.6z"></path>
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-800 mb-1">{t('result.analysis.expression')}</h4>
                      <p className="text-gray-800 text-sm italic">
                        {displayedAnalysis.analysis?.expression || t('result.analysis.expressionDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {displayedAnalysis.analysis.concept && (
                <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-400 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="rounded-full bg-indigo-100 p-2 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-600">
                        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-18c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zM3 12c0 1.65 1.35 3 3 3s3-1.35 3-3-1.35-3-3-3-3 1.35-3 3z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-800 mb-1">{t('result.analysis.concept')}</h4>
                      <p className="text-gray-800 text-sm italic">
                        {displayedAnalysis.analysis?.concept || t('result.analysis.conceptDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 아우라 및 톤앤매너 */}
      {displayedAnalysis.analysis && (displayedAnalysis.analysis.aura || displayedAnalysis.analysis.toneAndManner) && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.auraAndTone')}</span>
            <span className="ml-2 text-xs text-blue-700">{t('result.analysis.core')}</span>
          </h3>
          <div className="bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-inner">
            <div className="grid grid-cols-1 gap-4">
              {displayedAnalysis.analysis.aura && (
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
                      <span className="text-white text-sm">✨</span>
                    </div>
                    <h4 className="text-sm font-bold text-purple-800">{t('result.analysis.aura')}</h4>
                  </div>
                  <div className="pl-10">
                    <p className="text-gray-800 text-sm italic">"{displayedAnalysis.analysis.aura}"</p>
                  </div>
                </div>
              )}
              
              {displayedAnalysis.analysis.toneAndManner && (
                <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center mr-2">
                      <span className="text-white text-sm">🎨</span>
                    </div>
                    <h4 className="text-sm font-bold text-blue-800">{t('result.analysis.toneAndManner')}</h4>
                  </div>
                  <div className="pl-10">
                    <p className="text-gray-800 text-sm italic">"{displayedAnalysis.analysis.toneAndManner}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 매칭 키워드 */}
      {displayedAnalysis.matchingKeywords && displayedAnalysis.matchingKeywords.length > 0 && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.matchingKeywords')}</span>
            <span className="ml-2 text-xs text-orange-700">{t('result.analysis.keywordsDescription')}</span>
          </h3>
          <div className="bg-white rounded-xl py-3 px-4 border border-orange-200 min-h-[150px] max-h-[180px] overflow-auto">
            <KeywordCloud keywords={displayedAnalysis.matchingKeywords} />
          </div>
        </div>
      )}
      
      {/* 컬러 타입 */}
      {displayedAnalysis.personalColor && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
            <span className="bg-yellow-100 px-2 py-0.5 rounded">{t('result.analysis.personalColor')}</span>
            <span className="ml-2 text-xs text-teal-700">{t('result.analysis.personalColorDescription')}</span>
          </h3>
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100 shadow-sm">
            <div className="flex items-start mb-3">
              <div className="w-10 h-10 rounded-full flex-shrink-0 mr-3 flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${
                    displayedAnalysis.personalColor.palette?.[0] || '#fff'
                  }, ${
                    displayedAnalysis.personalColor.palette?.[1] || '#f9f9f9'
                  })`
                }}
              ></div>
              <div>
                <p className="text-gray-900 text-sm font-bold">
                  {displayedAnalysis.personalColor.season} {displayedAnalysis.personalColor.tone} {t('result.personalColorType')}
                </p>
                <p className="text-gray-700 text-sm mt-1 italic">
                  "{displayedAnalysis.personalColor.description}"
                </p>
                <p className="text-pink-700 text-xs mt-2 font-medium">
                  {t('result.analysis.personalColorDescription')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {displayedAnalysis.personalColor.palette && displayedAnalysis.personalColor.palette.map((color, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 rounded-full border shadow-sm transform hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-pink-100">
              <h5 className="text-xs font-bold text-pink-700 mb-2">{t('result.analysis.personalColorRecommendation')}</h5>
              <p className="text-gray-800 text-xs">
                {t('result.analysis.personalColorRecommendationDescription', '')}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};