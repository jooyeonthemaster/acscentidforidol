import React from 'react';
import { translateIngredient } from '../utils/translationHelpers';

interface PerfumeNotesProps {
  persona: any;
  currentLanguage: string;
  t: (key: string) => string;
}

export const PerfumeNotes: React.FC<PerfumeNotesProps> = ({ persona, currentLanguage, t }) => {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-amber-900 mb-2 flex items-center">
        <span className="mr-2">🌿</span>
        <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.notes')}</span>
      </h3>
      
      <div className="relative pt-6">
        {/* Top Note */}
        <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 p-3 rounded-t-lg border border-yellow-200 mb-1">
          <div className="flex items-start">
            <div className="bg-yellow-200 rounded-full p-2 mr-3 flex-shrink-0">
              <span className="text-yellow-700 font-bold text-xs">{t('result.perfume.topNote')}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-yellow-900">
                {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                {translateIngredient(persona?.mainScent?.name || '', currentLanguage) || t('result.perfume.topNoteDefault')}
              </h4>
              <p className="text-xs text-gray-700 mt-1">
                {t('result.perfume.topNoteDescription')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Middle Note */}
        <div className="bg-gradient-to-b from-amber-100 to-amber-50 p-3 border border-amber-200 mb-1">
          <div className="flex items-start">
            <div className="bg-amber-200 rounded-full p-2 mr-3 flex-shrink-0">
              <span className="text-amber-700 font-bold text-xs">{t('result.perfume.middleNote')}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                {translateIngredient(persona?.subScent1?.name || '', currentLanguage) || t('result.perfume.middleNoteDefault')}
              </h4>
              <p className="text-xs text-gray-700 mt-1">
                {t('result.perfume.middleNoteDescription')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Base Note */}
        <div className="bg-gradient-to-b from-orange-100 to-orange-50 p-3 rounded-b-lg border border-orange-200">
          <div className="flex items-start">
            <div className="bg-orange-200 rounded-full p-2 mr-3 flex-shrink-0">
              <span className="text-orange-700 font-bold text-xs">{t('result.perfume.baseNote')}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-900">
                {/* @ts-ignore - Perfume과 PerfumePersona 타입 차이로 인한 접근 허용 */}
                {translateIngredient(persona?.subScent2?.name || '', currentLanguage) || t('result.perfume.baseNoteDefault')}
              </h4>
              <p className="text-xs text-gray-700 mt-1">
                {t('result.perfume.baseNoteDescription')}
              </p>
            </div>
          </div>
        </div>
        
        {/* 향 발현 타임라인 */}
        <div className="mt-4 pt-2 border-t border-amber-100">
          <h5 className="text-xs font-medium text-gray-800 mb-2">{t('result.perfume.aromaTimeline')}</h5>
          <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1/6 bg-yellow-300 rounded-l-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">{t('result.perfume.topNote')}</span>
            </div>
            <div className="absolute left-1/6 top-0 h-full w-3/6 bg-amber-400 flex items-center justify-center">
              <span className="text-[8px] font-bold text-amber-900">{t('result.perfume.middleNote')}</span>
            </div>
            <div className="absolute right-0 top-0 h-full w-2/6 bg-orange-300 rounded-r-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-orange-900">{t('result.perfume.baseNote')}</span>
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-gray-700">
            <span>{t('result.perfume.topNoteDuration')}</span>
            <span>{t('result.perfume.middleNoteDuration')}</span>
            <span>{t('result.perfume.baseNoteDuration')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};