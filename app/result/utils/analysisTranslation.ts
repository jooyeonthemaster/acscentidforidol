import { ImageAnalysisResult } from '@/app/types/perfume';

/**
 * 분석 결과 데이터를 번역합니다
 */
export const translateAnalysisResult = async (
  result: ImageAnalysisResult, 
  targetLang: string,
  currentLanguage: string
): Promise<ImageAnalysisResult | null> => {
  if (currentLanguage === 'ko' || targetLang === 'ko') {
    return result; // 한국어면 번역 안 함
  }

  try {
    console.log('분석 결과 번역 시작:', targetLang);
    
    // 번역할 텍스트들 수집
    const textsToTranslate: string[] = [];
    const textMapping: Record<string, string> = {};

    // 분석 데이터 추가
    if (result.analysis?.mood) {
      textsToTranslate.push(result.analysis.mood);
      textMapping['mood'] = result.analysis.mood;
    }
    if (result.analysis?.style) {
      textsToTranslate.push(result.analysis.style);
      textMapping['style'] = result.analysis.style;
    }
    if (result.analysis?.expression) {
      textsToTranslate.push(result.analysis.expression);
      textMapping['expression'] = result.analysis.expression;
    }
    if (result.analysis?.concept) {
      textsToTranslate.push(result.analysis.concept);
      textMapping['concept'] = result.analysis.concept;
    }
    if (result.analysis?.aura) {
      textsToTranslate.push(result.analysis.aura);
      textMapping['aura'] = result.analysis.aura;
    }
    if (result.analysis?.toneAndManner) {
      textsToTranslate.push(result.analysis.toneAndManner);
      textMapping['toneAndManner'] = result.analysis.toneAndManner;
    }
    if (result.personalColor?.description) {
      textsToTranslate.push(result.personalColor.description);
      textMapping['personalColor_description'] = result.personalColor.description;
    }

    // 키워드 추가
    if (result.matchingKeywords && result.matchingKeywords.length > 0) {
      result.matchingKeywords.forEach((keyword, index) => {
        textsToTranslate.push(keyword);
        textMapping[`keyword_${index}`] = keyword;
      });
    }

    // 향수 매칭 데이터 추가
    if (result.matchingPerfumes && result.matchingPerfumes.length > 0) {
      result.matchingPerfumes.forEach((match, perfumeIndex) => {
        if (match.matchReason) {
          textsToTranslate.push(match.matchReason);
          textMapping[`perfume_${perfumeIndex}_matchReason`] = match.matchReason;
        }
        if (match.persona?.name) {
          textsToTranslate.push(match.persona.name);
          textMapping[`perfume_${perfumeIndex}_name`] = match.persona.name;
        }
        if (match.persona?.description) {
          textsToTranslate.push(match.persona.description);
          textMapping[`perfume_${perfumeIndex}_description`] = match.persona.description;
        }
      });
    }

    if (textsToTranslate.length === 0) {
      return result;
    }

    // 번역 API 호출
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        texts: textsToTranslate, 
        targetLanguage: targetLang, 
        action: 'translate' 
      })
    });

    if (!response.ok) {
      throw new Error('번역 API 호출 실패');
    }

    const translationResult = await response.json();
    const translatedTexts = translationResult.translatedTexts || [];
    
    console.log('번역 완료:', translatedTexts.length, '개 텍스트');

    // 번역된 결과로 새로운 객체 생성
    const translatedResult = JSON.parse(JSON.stringify(result));
    let textIndex = 0;

    // 분석 데이터 번역 적용
    if (result.analysis?.mood && textIndex < translatedTexts.length) {
      translatedResult.analysis.mood = translatedTexts[textIndex++];
    }
    if (result.analysis?.style && textIndex < translatedTexts.length) {
      translatedResult.analysis.style = translatedTexts[textIndex++];
    }
    if (result.analysis?.expression && textIndex < translatedTexts.length) {
      translatedResult.analysis.expression = translatedTexts[textIndex++];
    }
    if (result.analysis?.concept && textIndex < translatedTexts.length) {
      translatedResult.analysis.concept = translatedTexts[textIndex++];
    }
    if (result.analysis?.aura && textIndex < translatedTexts.length) {
      translatedResult.analysis.aura = translatedTexts[textIndex++];
    }
    if (result.analysis?.toneAndManner && textIndex < translatedTexts.length) {
      translatedResult.analysis.toneAndManner = translatedTexts[textIndex++];
    }
    if (result.personalColor?.description && textIndex < translatedTexts.length) {
      translatedResult.personalColor.description = translatedTexts[textIndex++];
    }

    // 키워드 번역 적용
    if (result.matchingKeywords && result.matchingKeywords.length > 0) {
      translatedResult.matchingKeywords = result.matchingKeywords.map((_, index) => {
        if (textIndex < translatedTexts.length) {
          return translatedTexts[textIndex++];
        }
        return result.matchingKeywords![index];
      });
    }

    // 향수 매칭 데이터 번역 적용
    if (result.matchingPerfumes && result.matchingPerfumes.length > 0) {
      translatedResult.matchingPerfumes = result.matchingPerfumes.map((match, perfumeIndex) => {
        const translatedMatch = { ...match };
        
        if (match.matchReason && textIndex < translatedTexts.length) {
          translatedMatch.matchReason = translatedTexts[textIndex++];
        }
        
        if (match.persona) {
          translatedMatch.persona = { ...match.persona };
          if (match.persona.name && textIndex < translatedTexts.length) {
            translatedMatch.persona.name = translatedTexts[textIndex++];
          }
          if (match.persona.description && textIndex < translatedTexts.length) {
            translatedMatch.persona.description = translatedTexts[textIndex++];
          }
        }
        
        return translatedMatch;
      });
    }

    console.log('번역 결과 적용 완료');
    return translatedResult;

  } catch (error) {
    console.error('번역 오류:', error);
    return null;
  }
};