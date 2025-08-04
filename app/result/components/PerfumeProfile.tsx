import React from 'react';
import { getLocalizedText } from '../utils/translationHelpers';

interface PerfumeProfileProps {
  persona: any;
  currentLanguage: string;
  t: (key: string) => string;
}

export const PerfumeProfile: React.FC<PerfumeProfileProps> = ({ persona, currentLanguage, t }) => {
  const getLocalizedTextWithLang = (translations: Record<string, string>): string => {
    return getLocalizedText(translations, currentLanguage);
  };

  if (!persona?.categories) return null;

  return (
    <div className="mb-6 pt-2">
      <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center">
        <span className="mr-2">⚗️</span>
        <span className="bg-amber-100 px-2 py-0.5 rounded">{t('result.perfume.perfumeProfile')}</span>
      </h3>
      
      <div className="bg-gradient-to-r from-gray-50 to-amber-50 rounded-xl p-4 border border-amber-100">
        {/* 카테고리 바 차트 */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {Object.entries(persona?.categories || {}).map(([category, value]) => {
            const categoryColors: Record<string, { bg: string, text: string, icon: string }> = {
              citrus: { bg: 'bg-yellow-400', text: 'text-yellow-800', icon: '🍋' },
              floral: { bg: 'bg-pink-400', text: 'text-pink-800', icon: '🌸' },
              woody: { bg: 'bg-amber-600', text: 'text-amber-900', icon: '🌳' },
              musky: { bg: 'bg-purple-400', text: 'text-purple-800', icon: '✨' },
              fruity: { bg: 'bg-red-400', text: 'text-red-800', icon: '🍎' },
              spicy: { bg: 'bg-orange-400', text: 'text-orange-800', icon: '🌶️' }
            };
            
            const categoryNames: Record<string, string> = {
              citrus: getLocalizedTextWithLang({ ko: '시트러스', en: 'Citrus', ja: 'シトラス', 'zh-cn': '柑橘', 'zh-tw': '柑橘' }),
              floral: getLocalizedTextWithLang({ ko: '플로럴', en: 'Floral', ja: 'フローラル', 'zh-cn': '花香', 'zh-tw': '花香' }),
              woody: getLocalizedTextWithLang({ ko: '우디', en: 'Woody', ja: 'ウッディ', 'zh-cn': '木香', 'zh-tw': '木香' }),
              musky: getLocalizedTextWithLang({ ko: '머스크', en: 'Musky', ja: 'ムスキー', 'zh-cn': '麝香', 'zh-tw': '麝香' }),
              fruity: getLocalizedTextWithLang({ ko: '프루티', en: 'Fruity', ja: 'フルーティ', 'zh-cn': '果香', 'zh-tw': '果香' }),
              spicy: getLocalizedTextWithLang({ ko: '스파이시', en: 'Spicy', ja: 'スパイシー', 'zh-cn': '辛香', 'zh-tw': '辛香' })
            };
            
            const color = categoryColors[category] || { bg: 'bg-gray-400', text: 'text-gray-800', icon: '⚪' };
            const percent = Math.min(Math.round((value as number) * 10), 100);
            
            return (
              <div key={category} className="flex items-center">
                <div className="flex-shrink-0 w-24 text-xs font-medium flex items-center mr-2">
                  <span className="mr-1">{color.icon}</span>
                  <span className={color.text.replace('text-yellow-800', 'text-yellow-900').replace('text-pink-800', 'text-pink-900').replace('text-amber-900', 'text-amber-950').replace('text-purple-800', 'text-purple-900').replace('text-red-800', 'text-red-900').replace('text-orange-800', 'text-orange-900')}>{categoryNames[category] || category}</span>
                </div>
                <div className="flex-grow bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className={`${color.bg} h-3 rounded-full`} 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <div className="flex-shrink-0 ml-2 text-xs font-bold text-gray-700">{value}</div>
              </div>
            );
          })}
        </div>
        
        {/* 주요 카테고리 특성 */}
        <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm">
          <p className="text-xs text-gray-800">
            <span className="font-bold">{t('result.perfume.mainSeries')}:</span> {(() => {
              const mainCategory = Object.entries(persona?.categories || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))[0];
              
              const categoryNames: Record<string, string> = {
                citrus: getLocalizedTextWithLang({ ko: '시트러스', en: 'Citrus', ja: 'シトラス', 'zh-cn': '柑橘', 'zh-tw': '柑橘' }),
                floral: getLocalizedTextWithLang({ ko: '플로럴', en: 'Floral', ja: 'フローラル', 'zh-cn': '花香', 'zh-tw': '花香' }),
                woody: getLocalizedTextWithLang({ ko: '우디', en: 'Woody', ja: 'ウッディ', 'zh-cn': '木香', 'zh-tw': '木香' }),
                musky: getLocalizedTextWithLang({ ko: '머스크', en: 'Musky', ja: 'ムスキー', 'zh-cn': '麝香', 'zh-tw': '麝香' }),
                fruity: getLocalizedTextWithLang({ ko: '프루티', en: 'Fruity', ja: 'フルーティ', 'zh-cn': '果香', 'zh-tw': '果香' }),
                spicy: getLocalizedTextWithLang({ ko: '스파이시', en: 'Spicy', ja: 'スパイシー', 'zh-cn': '辛香', 'zh-tw': '辛香' })
              };
              
              return categoryNames[mainCategory[0]] || mainCategory[0];
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};