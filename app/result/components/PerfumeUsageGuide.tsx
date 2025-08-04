import React from 'react';

interface PerfumeUsageGuideProps {
  t: (key: string) => string;
}

export const PerfumeUsageGuide: React.FC<PerfumeUsageGuideProps> = ({ t }) => {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
        <span className="mr-2">🧪</span>
        <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.usageGuide')}</span>
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 shadow-sm">
          <h4 className="text-sm font-bold text-pink-900 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1 text-pink-700">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <path d="M12 18h.01"></path>
            </svg>
            {t('result.perfume.howToUse')}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {/* 손목, 귀 뒤 */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                <span className="text-pink-700 text-xl">🎯</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-pink-800">{t('result.perfume.hand')}</p>
                <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.pulseLocation')}</p>
              </div>
            </div>
            {/* 옷에 뿌리기 */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                <span className="text-pink-700 text-xl">👕</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-pink-800">{t('result.perfume.wear')}</p>
                <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.distance')}</p>
              </div>
            </div>
            {/* 공기 중 분사 */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-pink-100 text-center flex items-center">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3 shrink-0">
                <span className="text-pink-700 text-xl">💨</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-pink-800">{t('result.perfume.spray')}</p>
                <p className="text-xs text-gray-700 whitespace-nowrap">{t('result.perfume.aromaCloud')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 향수 지속력 */}
        <div className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
          <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center">
            <span className="mr-1">⏱️</span>
            {t('result.perfume.lasting')}
          </h4>
          <div className="relative h-4 bg-gray-100 rounded-full mb-2">
            <div className="absolute left-0 top-0 h-full w-[85%] bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full"></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-700">
            <span>{t('result.perfume.lastingDuration')}</span>
            <span>{t('result.perfume.lastingDescription')}</span>
            <span>{t('result.perfume.lastingPlus')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};