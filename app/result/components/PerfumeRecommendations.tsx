import React from 'react';
import { getLocalizedText, getSeasonText, getTimeText } from '../utils/translationHelpers';

interface PerfumeRecommendationsProps {
  persona: any;
  currentLanguage: string;
  t: (key: string) => string;
}

export const PerfumeRecommendations: React.FC<PerfumeRecommendationsProps> = ({ persona, currentLanguage, t }) => {
  const getLocalizedTextWithLang = (translations: Record<string, string>): string => {
    return getLocalizedText(translations, currentLanguage);
  };

  return (
    <div className="grid grid-cols-1 gap-3 mt-2">
      {/* 계절 추천 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
        <h5 className="text-xs font-bold text-emerald-900 mb-2 flex items-center">
          <span className="mr-1">🌿</span>
          {t('result.perfume.recommendedSeason')}
        </h5>
        <div className="flex justify-between">
          {[
            getLocalizedTextWithLang({ ko: '봄', en: 'Spring', ja: '春', 'zh-cn': '春季', 'zh-tw': '春季' }),
            getLocalizedTextWithLang({ ko: '여름', en: 'Summer', ja: '夏', 'zh-cn': '夏季', 'zh-tw': '夏季' }),
            getLocalizedTextWithLang({ ko: '가을', en: 'Autumn', ja: '秋', 'zh-cn': '秋季', 'zh-tw': '秋季' }),
            getLocalizedTextWithLang({ ko: '겨울', en: 'Winter', ja: '冬', 'zh-cn': '冬季', 'zh-tw': '冬季' })
          ].map((season, idx) => {
            const seasonTexts = getSeasonText(currentLanguage);
            const seasonRecommendation = (() => {
              const categoryEntries = Object.entries(persona?.categories || {})
                .sort(([, a], [, b]) => (b as number) - (a as number));
              
              if (categoryEntries.length === 0) return [seasonTexts.spring(), seasonTexts.summer()];
              
              const [categoryName, score] = categoryEntries[0];
              
              if (categoryName === 'citrus') {
                if (score >= 8) return [seasonTexts.summer()];
                if (score >= 6) return [seasonTexts.spring(), seasonTexts.summer()];
                return [seasonTexts.spring(), seasonTexts.summer(), seasonTexts.autumn()];
              } else if (categoryName === 'fruity') {
                if (score >= 8) return [seasonTexts.summer()];
                if (score >= 6) return [seasonTexts.spring(), seasonTexts.summer()];
                return [seasonTexts.spring(), seasonTexts.summer(), seasonTexts.autumn()];
              } else if (categoryName === 'woody') {
                if (score >= 8) return [seasonTexts.winter()];
                if (score >= 6) return [seasonTexts.autumn(), seasonTexts.winter()];
                return [seasonTexts.summer(), seasonTexts.autumn(), seasonTexts.winter()];
              } else if (categoryName === 'spicy') {
                if (score >= 8) return [seasonTexts.winter()];
                if (score >= 6) return [seasonTexts.autumn(), seasonTexts.winter()];
                return [seasonTexts.summer(), seasonTexts.autumn(), seasonTexts.winter()];
              } else if (categoryName === 'floral') {
                if (score >= 8) return [seasonTexts.spring()];
                if (score >= 6) return [seasonTexts.spring(), seasonTexts.summer()];
                return [seasonTexts.spring(), seasonTexts.summer(), seasonTexts.autumn()];
              } else { // musky or unknown
                if (score >= 8) return [seasonTexts.winter()];
                if (score >= 6) return [seasonTexts.autumn(), seasonTexts.winter()];
                return [seasonTexts.spring(), seasonTexts.autumn(), seasonTexts.winter()];
              }
            })();
            
            const isRecommended = seasonRecommendation.includes(season);
            
            return (
              <div key={season} className="text-center">
                <div className={`w-10 h-10 rounded-full ${isRecommended ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-400'} flex items-center justify-center mx-auto`}>
                  {idx === 0 && '🌸'}
                  {idx === 1 && '☀️'}
                  {idx === 2 && '🍂'}
                  {idx === 3 && '❄️'}
                </div>
                <p className={`text-[10px] mt-1 ${isRecommended ? 'font-bold text-emerald-900' : 'text-gray-700'}`}>
                  {season}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 시간대 추천 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h5 className="text-xs font-bold text-blue-900 mb-2 flex items-center">
          <span className="mr-1">🕰️</span>
          {t('result.perfume.recommendedTime')}
        </h5>
        <div className="flex justify-between">
          {[
            getLocalizedTextWithLang({ ko: '오전', en: 'Morning', ja: '朝', 'zh-cn': '上午', 'zh-tw': '上午' }),
            getLocalizedTextWithLang({ ko: '오후', en: 'Afternoon', ja: '午後', 'zh-cn': '下午', 'zh-tw': '下午' }),
            getLocalizedTextWithLang({ ko: '저녁', en: 'Evening', ja: '夕方', 'zh-cn': '傍晚', 'zh-tw': '傍晚' }),
            getLocalizedTextWithLang({ ko: '밤', en: 'Night', ja: '夜', 'zh-cn': '夜晚', 'zh-tw': '夜晚' })
          ].map((time, idx) => {
            const timeTexts = getTimeText(currentLanguage);
            const timeRecommendation = (() => {
              const categoryEntries = Object.entries(persona?.categories || {})
                .sort(([, a], [, b]) => (b as number) - (a as number));
              
              if (categoryEntries.length === 0) return [timeTexts.morning(), timeTexts.afternoon()];
              
              const [categoryName, score] = categoryEntries[0];
              
              if (categoryName === 'citrus') {
                if (score >= 8) return [timeTexts.morning()];
                if (score >= 6) return [timeTexts.morning(), timeTexts.afternoon()];
                return [timeTexts.morning(), timeTexts.afternoon(), timeTexts.evening()];
              } else if (categoryName === 'fruity') {
                if (score >= 8) return [timeTexts.morning()];
                if (score >= 6) return [timeTexts.morning(), timeTexts.afternoon()];
                return [timeTexts.morning(), timeTexts.afternoon(), timeTexts.evening()];
              } else if (categoryName === 'woody') {
                if (score >= 8) return [timeTexts.night()];
                if (score >= 6) return [timeTexts.evening(), timeTexts.night()];
                return [timeTexts.afternoon(), timeTexts.evening(), timeTexts.night()];
              } else if (categoryName === 'musky') {
                if (score >= 8) return [timeTexts.night()];
                if (score >= 6) return [timeTexts.evening(), timeTexts.night()];
                return [timeTexts.afternoon(), timeTexts.evening(), timeTexts.night()];
              } else if (categoryName === 'floral') {
                if (score >= 8) return [timeTexts.afternoon()];
                if (score >= 6) return [timeTexts.morning(), timeTexts.afternoon()];
                return [timeTexts.morning(), timeTexts.afternoon(), timeTexts.evening()];
              } else { // spicy or unknown
                if (score >= 8) return [timeTexts.evening()];
                if (score >= 6) return [timeTexts.evening(), timeTexts.night()];
                return [timeTexts.morning(), timeTexts.evening(), timeTexts.night()];
              }
            })();
            
            const isRecommended = timeRecommendation.includes(time);
            
            return (
              <div key={time} className="text-center">
                <div className={`w-10 h-10 rounded-full ${isRecommended ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-400'} flex items-center justify-center mx-auto`}>
                  {idx === 0 && '🌅'}
                  {idx === 1 && '☀️'}
                  {idx === 2 && '🌆'}
                  {idx === 3 && '🌙'}
                </div>
                <p className={`text-[10px] mt-1 ${isRecommended ? 'font-bold text-blue-900' : 'text-gray-700'}`}>
                  {time}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};