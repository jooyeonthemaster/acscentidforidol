/**
 * 언어별 텍스트 반환 헬퍼 함수
 */
export const getLocalizedText = (translations: Record<string, string>, currentLanguage: string): string => {
  return translations[currentLanguage] || translations['ko'];
};

/**
 * 계절별 다국어 텍스트 헬퍼 함수들
 */
export const getSeasonText = (currentLanguage: string) => ({
  spring: () => getLocalizedText({ ko: '봄', en: 'Spring', ja: '春', 'zh-cn': '春季', 'zh-tw': '春季' }, currentLanguage),
  summer: () => getLocalizedText({ ko: '여름', en: 'Summer', ja: '夏', 'zh-cn': '夏季', 'zh-tw': '夏季' }, currentLanguage),
  autumn: () => getLocalizedText({ ko: '가을', en: 'Autumn', ja: '秋', 'zh-cn': '秋季', 'zh-tw': '秋季' }, currentLanguage),
  winter: () => getLocalizedText({ ko: '겨울', en: 'Winter', ja: '冬', 'zh-cn': '冬季', 'zh-tw': '冬季' }, currentLanguage)
});

/**
 * 시간대별 다국어 텍스트 헬퍼 함수들
 */
export const getTimeText = (currentLanguage: string) => ({
  morning: () => getLocalizedText({ ko: '오전', en: 'Morning', ja: '朝', 'zh-cn': '上午', 'zh-tw': '上午' }, currentLanguage),
  afternoon: () => getLocalizedText({ ko: '오후', en: 'Afternoon', ja: '午後', 'zh-cn': '下午', 'zh-tw': '下午' }, currentLanguage),
  evening: () => getLocalizedText({ ko: '저녁', en: 'Evening', ja: '夕方', 'zh-cn': '傍晚', 'zh-tw': '傍晚' }, currentLanguage),
  night: () => getLocalizedText({ ko: '밤', en: 'Night', ja: '夜', 'zh-cn': '夜晚', 'zh-tw': '夜晚' }, currentLanguage)
});

/**
 * 향료 이름을 번역하는 함수
 */
export const translateIngredient = (ingredientName: string, currentLanguage: string): string => {
  if (!ingredientName) return '';
  
  // 다국어 향료 이름 매핑
  const ingredientTranslations: Record<string, Record<string, string>> = {
    // 한국어 키
    '타임': { ko: '타임', en: 'Thyme', ja: 'タイム', 'zh-cn': '百里香', 'zh-tw': '百里香' },
    '제라늄': { ko: '제라늄', en: 'Geranium', ja: 'ゼラニウム', 'zh-cn': '天竺葵', 'zh-tw': '天竺葵' },
    '엘레미': { ko: '엘레미', en: 'Elemi', ja: 'エレミ', 'zh-cn': '榄香', 'zh-tw': '欖香' },
    '베르가못': { ko: '베르가못', en: 'Bergamot', ja: 'ベルガモット', 'zh-cn': '佛手柑', 'zh-tw': '佛手柑' },
    '만다린': { ko: '만다린', en: 'Mandarin', ja: 'マンダリン', 'zh-cn': '橘子', 'zh-tw': '橘子' },
    '오렌지': { ko: '오렌지', en: 'Orange', ja: 'オレンジ', 'zh-cn': '橙子', 'zh-tw': '橙子' },
    '레몬': { ko: '레몬', en: 'Lemon', ja: 'レモン', 'zh-cn': '柠檬', 'zh-tw': '檸檬' },
    '그레이프프루트': { ko: '그레이프프루트', en: 'Grapefruit', ja: 'グレープフルーツ', 'zh-cn': '葡萄柚', 'zh-tw': '葡萄柚' },
    '장미': { ko: '장미', en: 'Rose', ja: 'ローズ', 'zh-cn': '玫瑰', 'zh-tw': '玫瑰' },
    '자스민': { ko: '자스민', en: 'Jasmine', ja: 'ジャスミン', 'zh-cn': '茉莉', 'zh-tw': '茉莉' },
    '백합': { ko: '백합', en: 'Lily', ja: 'リリー', 'zh-cn': '百合', 'zh-tw': '百合' },
    '라벤더': { ko: '라벤더', en: 'Lavender', ja: 'ラベンダー', 'zh-cn': '薰衣草', 'zh-tw': '薰衣草' },
    '샌달우드': { ko: '샌달우드', en: 'Sandalwood', ja: 'サンダルウッド', 'zh-cn': '檀香', 'zh-tw': '檀香' },
    '시더': { ko: '시더', en: 'Cedar', ja: 'シダー', 'zh-cn': '雪松', 'zh-tw': '雪松' },
    '오크': { ko: '오크', en: 'Oak', ja: 'オーク', 'zh-cn': '橡木', 'zh-tw': '橡木' },
    '소나무': { ko: '소나무', en: 'Pine', ja: 'パイン', 'zh-cn': '松树', 'zh-tw': '松樹' },
    '머스크': { ko: '머스크', en: 'Musk', ja: 'ムスク', 'zh-cn': '麝香', 'zh-tw': '麝香' },
    '앰버': { ko: '앰버', en: 'Amber', ja: 'アンバー', 'zh-cn': '琥珀', 'zh-tw': '琥珀' },
    '바닐라': { ko: '바닐라', en: 'Vanilla', ja: 'バニラ', 'zh-cn': '香草', 'zh-tw': '香草' },
    '계피': { ko: '계피', en: 'Cinnamon', ja: 'シナモン', 'zh-cn': '肉桂', 'zh-tw': '肉桂' },
    '후추': { ko: '후추', en: 'Pepper', ja: 'ペッパー', 'zh-cn': '胡椒', 'zh-tw': '胡椒' },
    '생강': { ko: '생강', en: 'Ginger', ja: 'ジンジャー', 'zh-cn': '生姜', 'zh-tw': '生薑' }
  };
  
  // 영어 키 매핑 추가
  const englishKeys = ['thyme', 'geranium', 'elemi', 'bergamot', 'mandarin', 'orange', 'lemon', 'grapefruit', 'rose', 'jasmine', 'lily', 'lavender', 'sandalwood', 'cedar', 'oak', 'pine', 'musk', 'amber', 'vanilla', 'cinnamon', 'pepper', 'ginger'];
  const koreanKeys = Object.keys(ingredientTranslations);
  
  englishKeys.forEach((englishKey, index) => {
    if (koreanKeys[index]) {
      ingredientTranslations[englishKey] = ingredientTranslations[koreanKeys[index]];
    }
  });
  
  // 원본 이름과 소문자 변환된 이름 모두 확인
  const translation = ingredientTranslations[ingredientName] || ingredientTranslations[ingredientName.toLowerCase()];
  if (translation) {
    return getLocalizedText(translation, currentLanguage);
  }
  
  return ingredientName;
};