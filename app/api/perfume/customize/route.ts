import { NextRequest, NextResponse } from 'next/server';
import { PerfumeFeedback, CustomPerfumeRecipe, PerfumeCategory, CategoryPreference, PerfumePersona, GeminiPerfumeSuggestion, TestingGranule, SpecificScent, CategoryDataPoint } from '@/app/types/perfume';
import perfumePersonas from '@/app/data/perfumePersonas';
import { generateCustomPerfumePrompt, parseGeminiPerfumeSuggestion } from '@/app/utils/promptTemplates/feedbackPrompts';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { saveImprovedRecipe } from '@/lib/firestoreApi';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('CRITICAL: Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  // 프로덕션 환경에서는 이 경우 에러를 발생시켜 서버 시작을 중단시키는 것이 안전합니다.
  // throw new Error('CRITICAL: Gemini API 키가 설정되지 않았습니다.'); 
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ""); // API 키가 없으면 빈 문자열로 초기화 (오류 발생 가능성 있음)

const MAX_RETRIES = 1; // 최대 재시도 횟수 (0으로 설정하면 재시도 안 함, 테스트 용도로 1로 설정)

/**
 * 피드백 데이터를 기반으로 맞춤형 향수 레시피 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 /api/perfume/customize API 호출됨');
    
    const data = await request.json();
    console.log('🚀 받은 데이터:', {
      hasUserId: !!data.userId,
      hasSessionId: !!data.sessionId,
      hasFeedback: !!data.feedback,
      userId: data.userId,
      sessionId: data.sessionId,
      feedbackPerfumeId: data.feedback?.perfumeId
    });
    
    const clientFeedback: PerfumeFeedback = data.feedback; // 타입 단순화
    const userId = data.userId;
    const sessionId = data.sessionId;
    
    if (!clientFeedback || !clientFeedback.perfumeId) {
      console.log('❌ 유효하지 않은 피드백 데이터');
      return NextResponse.json({ error: '유효하지 않은 피드백 데이터입니다.' }, { status: 400 });
    }
    
    const originalPerfume = perfumePersonas.personas.find(p => p.id === clientFeedback.perfumeId);
    
    if (!originalPerfume) {
      return NextResponse.json({ error: '해당 원본 향수를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 원본 향수 정보를 기반으로 피드백에 추가 정보 설정
    if (originalPerfume.name && !clientFeedback.perfumeName) {
      clientFeedback.perfumeName = originalPerfume.name;
    }

    // overallExplanation과 contradictionWarning 제거 (PerfumeFeedback 타입에 없음)
    // const overallExplanation = clientFeedback.overallExplanation || '';
    // const contradictionWarning = clientFeedback.contradictionWarning || '';

    console.log('향수 개선 프롬프트 생성 중...');
    
    const categoryKeyToKorean: Record<PerfumeCategory, string> = {
      citrus: '시트러스',
      floral: '플로럴',
      woody: '우디',
      musky: '머스크',
      fruity: '프루티',
      spicy: '스파이시'
    };
    
    const initialCategoryGraphData: CategoryDataPoint[] = Object.entries(originalPerfume.categories).map(([axisKey, value]) => ({
      axis: categoryKeyToKorean[axisKey as PerfumeCategory] || axisKey,
      value: value
    }));

    const feedbackForPrompt: GeminiPerfumeSuggestion & { 
      categoryPreferences?: PerfumeFeedback['categoryPreferences'], 
      userCharacteristics?: PerfumeFeedback['userCharacteristics'], 
      specificScents?: SpecificScent[],
      notes?: PerfumeFeedback['notes'],
      impression?: PerfumeFeedback['impression']
    } = {
      perfumeId: originalPerfume.id,
      originalPerfumeName: originalPerfume.name,
      retentionPercentage: clientFeedback.retentionPercentage ?? 50,
      initialCategoryGraphData: initialCategoryGraphData,
      // 아래 필드들은 AI가 채우거나, feedbackForPrompt 구성 시 기본값/플레이스홀더로 초기화
      adjustedCategoryGraphData: [], 
      categoryChanges: [], 
      testingRecipe: null, // AI가 채울 필드이므로 null 또는 기본 구조로 초기화
      isFinalRecipe: (clientFeedback.retentionPercentage === 100), // 100%면 최종 레시피로 간주
      overallExplanation: originalPerfume.description, // PerfumeFeedback에 overallExplanation 필드 없음
      contradictionWarning: null, // PerfumeFeedback에 contradictionWarning 필드 없음
      // PerfumeFeedback에서 직접 전달받는 필드들
      categoryPreferences: clientFeedback.categoryPreferences,
      userCharacteristics: clientFeedback.userCharacteristics,
      specificScents: clientFeedback.specificScents,
      notes: clientFeedback.notes,
      impression: clientFeedback.impression,
      // finalRecipeDetails는 isFinalRecipe가 true일 때 채워지거나 AI가 생성
    };
    
    if (feedbackForPrompt.isFinalRecipe) {
      // TODO: 100% 유지 시 finalRecipeDetails를 실제로 구성하는 로직 필요.
      // 현재는 isFinalRecipe 플래그만 true로 설정하고, 나머지 필요한 정보는 feedbackForPrompt에서 가져옴.
      // overallExplanation 등을 적절히 설정해주는 것이 좋음.
      const finalData: GeminiPerfumeSuggestion = {
        ...feedbackForPrompt,
        overallExplanation: feedbackForPrompt.overallExplanation || `${originalPerfume.name}의 향을 100% 유지하는 레시피입니다.`,
        testingRecipe: null, // 100% 유지 시 테스팅 레시피 없음
        // finalRecipeDetails: { ... } // 여기에 실제 레시피 정보 구성
      };
      
      // Firebase에 레시피 저장 (100% 유지 케이스)
      if (userId && sessionId) {
        try {
          const recipeData = {
            originalPerfumeId: originalPerfume.id,
            originalPerfumeName: originalPerfume.name,
            feedbackSummary: {
              overallRating: clientFeedback.overallRating || 5, // 기본값 5
              retentionPercentage: clientFeedback.retentionPercentage ?? 50, // 기본값 50
              mainConcerns: clientFeedback.additionalComments || '피드백 없음' // 기본값
            },
            improvedRecipe: finalData,
            generatedAt: new Date().toISOString()
          };
          await saveImprovedRecipe(userId, sessionId, recipeData);
          console.log('Firebase에 최종 레시피 저장 완료');
        } catch (firebaseError) {
          console.error('Firebase 레시피 저장 오류:', firebaseError);
          // Firebase 저장 실패해도 레시피는 반환
        }
      }
      
      return NextResponse.json({ success: true, data: finalData });
    }
        
    const result = await callAndValidateWithRetry(feedbackForPrompt, MAX_RETRIES); 
    
    if (result && 'error' in result) { // 최종 실패 시 오류 객체 반환됨
      console.error('callAndValidateWithRetry 최종 실패:', result.error);
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    if (!result) { // 혹시 모를 null 반환 케이스 (이론상 발생 안해야 함)
        console.error('callAndValidateWithRetry에서 예외적으로 null 반환됨');
        return NextResponse.json({ error: 'AI 추천 생성 중 알 수 없는 내부 오류가 발생했습니다.' }, { status: 500 });
    }
    
    // Firebase에 레시피 저장 (테스팅 레시피 케이스)
    if (userId && sessionId) {
      try {
        const recipeData = {
          originalPerfumeId: originalPerfume.id,
          originalPerfumeName: originalPerfume.name,
          feedbackSummary: {
            overallRating: clientFeedback.overallRating || 5, // 기본값 5
            retentionPercentage: clientFeedback.retentionPercentage ?? 50, // 기본값 50
            mainConcerns: clientFeedback.additionalComments || '피드백 없음' // 기본값
          },
          improvedRecipe: result,
          generatedAt: new Date().toISOString()
        };
        await saveImprovedRecipe(userId, sessionId, recipeData);
        console.log('Firebase에 테스팅 레시피 저장 완료');
        
        // 🔄 새로운 레시피 저장 후 관리자 캐시 무효화
        try {
          const { invalidateSessionCache } = await import('@/lib/cacheManager');
          const invalidatedCount = invalidateSessionCache(userId, sessionId);
          console.log(`🗑️ 레시피 저장 후 관리자 캐시 무효화: ${invalidatedCount}개 항목`);
        } catch (cacheError) {
          console.warn('⚠️ 캐시 무효화 중 오류 (레시피 저장은 성공):', cacheError);
        }
      } catch (firebaseError) {
        console.error('Firebase 레시피 저장 오류:', firebaseError);
        // Firebase 저장 실패해도 레시피는 반환
      }
    }
    
    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('맞춤형 향수 레시피 생성 API 핸들러에서 예외 발생:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 서버 오류 발생';
    // 클라이언트에 너무 상세한 오류 메시지를 보내지 않도록 주의
    const clientErrorMessage = errorMessage.startsWith('SERVER_ERROR:') || errorMessage.startsWith('CRITICAL:') 
                             ? '서버 내부 설정 오류로 인해 요청을 처리할 수 없습니다.' 
                             : `맞춤형 향수 레시피를 생성하는 중 오류가 발생했습니다.`;
    return NextResponse.json(
      { error: clientErrorMessage },
      { status: 500 }
    );
  }
}

async function callAndValidateWithRetry(
  originalFeedbackForPrompt: GeminiPerfumeSuggestion & { 
    categoryPreferences?: PerfumeFeedback['categoryPreferences'], 
    userCharacteristics?: PerfumeFeedback['userCharacteristics'], 
    specificScents?: SpecificScent[],
    notes?: PerfumeFeedback['notes'],
    impression?: PerfumeFeedback['impression']
  },
  maxRetries: number
): Promise<GeminiPerfumeSuggestion | { error: string, status: number }> { // 오류 객체 반환 타입 추가
  let attempts = 0;
  let currentPrompt = generateCustomPerfumePrompt(originalFeedbackForPrompt);
  let lastErrorDetail: string | null = null;

  const personaDataSourceForRetry = "'@/app/data/perfumePersonas.ts' 파일의 'personas' 배열"; // 재시도 프롬프트용

  while (attempts <= maxRetries) {
    console.log(`INFO: Gemini API 호출 시도 ${attempts + 1}/${maxRetries + 1}`);
    const geminiResponseText = await callGeminiAPI(currentPrompt); 
    const recipeSuggestion = parseGeminiPerfumeSuggestion(geminiResponseText);

    if (!recipeSuggestion) {
      lastErrorDetail = 'AI 응답 파싱 실패 또는 데이터 형식 오류.';
      console.error(`ATTEMPT ${attempts + 1} FAILED: Gemini API 응답 파싱 실패. Raw Response:`, geminiResponseText?.substring(0, 500));
      attempts++;
      if (attempts > maxRetries) break;
      // 파싱 실패는 프롬프트 문제일 가능성이 낮으므로 동일 프롬프트로 재시도
      console.log('INFO: 파싱 실패로 재시도합니다 (동일 프롬프트).');
      continue; 
    }

    let invalidGranuleInfo: { id: string, name: string, issue: string } | null = null;
    if (recipeSuggestion.testingRecipe && recipeSuggestion.testingRecipe.granules) {
      if (recipeSuggestion.testingRecipe.granules.length === 0 && originalFeedbackForPrompt.retentionPercentage !== 100) {
        // 100% 유지가 아닌데 추천 향료가 없는 경우 (AI가 빈 배열을 반환한 경우)
        invalidGranuleInfo = { id: 'N/A', name: 'N/A', issue: 'AI가 추천 향료(granules)를 생성하지 않았습니다.' };
      } else {
        const validPersonaIds = new Set(perfumePersonas.personas.map(p => p.id));
        const validPersonaMap = new Map(perfumePersonas.personas.map(p => [p.id, p.name]));

        for (const granule of recipeSuggestion.testingRecipe.granules) {
          if (!granule.id || !granule.name) {
            invalidGranuleInfo = { id: granule.id || 'ID 누락', name: granule.name || '이름 누락', issue: '추천된 향료에 ID 또는 이름이 누락되었습니다.' };
            break;
          }
          if (!validPersonaIds.has(granule.id)) {
            invalidGranuleInfo = { id: granule.id, name: granule.name, issue: `시스템에 존재하지 않는 ID ('${granule.id}')` };
            break;
          }
          const expectedName = validPersonaMap.get(granule.id);
          if (expectedName !== granule.name) {
            invalidGranuleInfo = { id: granule.id, name: granule.name, issue: `ID ('${granule.id}')에 해당하는 이름 불일치 (시스템: '${expectedName}', AI 응답: '${granule.name}')` };
            break;
          }
        }
      }
    }

    if (invalidGranuleInfo) {
      lastErrorDetail = `추천된 향료에서 문제 발생: ${invalidGranuleInfo.issue}.`;
      console.error(`ATTEMPT ${attempts + 1} FAILED: AI 응답 검증 실패 - ${lastErrorDetail}`);
      attempts++;
      if (attempts > maxRetries) break;
      
      // AI에게 오류를 알리고 수정을 요청하는 새 프롬프트 생성
      const retryInstruction = `경고: 이전 AI 응답에서 다음의 심각한 오류가 발견되었습니다: "${lastErrorDetail}". \n이번에는 반드시 다음 규칙을 따라주십시오: 모든 추천 향료(granules)의 id와 name은 반드시 ${personaDataSourceForRetry}에 정의된 실제 향수 데이터와 정확히 일치해야 합니다. 존재하지 않거나 일치하지 않는 ID/이름을 사용하면 안 됩니다. 이 규칙은 절대적입니다. 다른 모든 지침은 동일합니다.\n\n`;
      currentPrompt = retryInstruction + generateCustomPerfumePrompt(originalFeedbackForPrompt);
      
      console.log(`INFO: 잘못된 ID/이름 (${invalidGranuleInfo.issue})으로 인해 재시도합니다. (시도 ${attempts}/${maxRetries + 1})`);
      continue;
    }

    console.log(`INFO: ATTEMPT ${attempts + 1} SUCCESS: 유효한 응답 (${recipeSuggestion.perfumeId})을 받았습니다.`);
    return recipeSuggestion; // 성공
  }

  console.error(`CRITICAL: 최대 재시도 (${maxRetries + 1}회) 후에도 유효한 응답을 얻지 못했습니다. 마지막 상세 오류: ${lastErrorDetail}`);
  return { error: lastErrorDetail || 'AI 추천 생성에 최종 실패했습니다.', status: 500 }; // 최종 실패 시 오류 객체 반환
}

/**
 * 실제 Gemini API 호출 함수
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    // 이 함수가 호출되기 전에 이미 API 키 체크가 되어 있어야 하지만, 방어적으로 추가
    console.error('INTERNAL ERROR: callGeminiAPI 호출되었으나 API 키 없음.');
    throw new Error('SERVER_ERROR: API 키가 설정되지 않아 Gemini 호출 불가.');
  }
  // console.log("Attempting to call Gemini API..."); // 로그 간소화
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
    const generationConfig = { maxOutputTokens: 8192 }; // 필요시 토큰 수 조정

    const result = await model.generateContent(prompt, generationConfig);
    const response = result.response;
    
    if (!response) {
      const blockReason = result.response?.promptFeedback?.blockReason;
      console.error('Gemini API 응답 객체 없음. Block Reason:', blockReason, 'Full result:', JSON.stringify(result, null, 2));
      throw new Error(`AI 응답 생성 실패 (응답 객체 없음)${blockReason ? ' - 차단 이유: ' + blockReason : ''}`);
    }

    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      const finishReason = response.candidates?.[0]?.finishReason;
      let errorMessage = 'AI 응답 생성 실패 (후보 없음)';
      if (blockReason) errorMessage += ` - 프롬프트 차단 이유: ${blockReason}`;
      if (finishReason) errorMessage += ` - 생성 중단 이유: ${finishReason}`;
      console.error(errorMessage, 'Full response:', JSON.stringify(response, null, 2));
      throw new Error(errorMessage);
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0 || !candidate.content.parts[0].text) {
      const finishReason = candidate.finishReason;
      let errorMessage = 'AI 응답 생성 실패 (내용 없음)';
      if (finishReason) errorMessage += ` - 생성 중단 이유: ${finishReason}`;
      console.error(errorMessage, 'Full candidate:', JSON.stringify(candidate, null, 2));
      throw new Error(errorMessage);
    }
    return candidate.content.parts[0].text;
  } catch (error) {
    console.error('Gemini API 호출 중 상세 오류 발생:', error);
    const detailMessage = error instanceof Error ? error.message : '알 수 없는 API 내부 오류';
    // SERVER_ERROR: 또는 CRITICAL: 접두사를 붙여 클라이언트에게 내부 오류임을 간접적으로 알림
    throw new Error(`SERVER_ERROR: Gemini API와 통신 중 오류가 발생했습니다: ${detailMessage}`);
  }
}

/**
 * 기본 향료 구성요소 생성
 */
function getBaseScentComponents(perfume: PerfumePersona, feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  // 유지 비율 (기본값: 50%)
  const retentionRatio = (feedback.retentionPercentage ?? 50) / 100;
  
  // 가장 높은 카테고리 점수 3개 선택
  const categoryScores = Object.entries(perfume.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // 각 카테고리에 해당하는 향료 선택
  return categoryScores.map(([category, score]) => {
    // 카테고리별 대표 향료 선택
    const scentName = getCategoryScentName(category as PerfumeCategory, perfume.id);
    
    // 기본 비율 계산 (카테고리 점수에 따라 차등)
    const baseRatio = (score / 10) * 70 * retentionRatio; // 최대 70%까지 할당하고 유지 비율 적용
    
    return {
      name: scentName,
      ratio: baseRatio,
      category: category as PerfumeCategory
    };
  });
}

/**
 * 카테고리별 대표 향료 이름 가져오기
 */
function getCategoryScentName(category: PerfumeCategory, perfumeId: string): string {
  // 카테고리별 대표 향료 매핑
  const categoryScents: Record<PerfumeCategory, string[]> = {
    citrus: ['베르가못', '레몬', '라임', '오렌지'],
    floral: ['로즈', '자스민', '튤립', '라벤더'],
    woody: ['샌달우드', '시더우드', '베티버', '파인'],
    musky: ['머스크', '앰버', '바닐라', '통카빈'],
    fruity: ['복숭아', '딸기', '블랙베리', '레드베리'],
    spicy: ['핑크페퍼', '블랙페퍼', '진저', '시나몬']
  };
  
  // 향수 ID를 기반으로 일관된 선택
  const scentIndex = Math.abs(
    perfumeId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  ) % categoryScents[category].length;
  
  return categoryScents[category][scentIndex];
}

/**
 * 피드백에 따른 특성 조정 향료 생성
 */
function getCharacteristicScentComponents(feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  const components: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }> = [];
  
  // 카테고리 선호도 처리
  if (feedback.categoryPreferences) {
    Object.entries(feedback.categoryPreferences).forEach(([category, preference]) => {
      if (preference === 'increase') {
        // 해당 카테고리 향 증가
        components.push({
          name: getCategoryAdjustmentScent(category as PerfumeCategory, true),
          ratio: 15, // 15% 할당
          category: category as PerfumeCategory
        });
      } else if (preference === 'decrease') {
        // 반대 카테고리 향 증가하여 상대적으로 감소 효과
        const oppositeCategory = getOppositeCategory(category as PerfumeCategory);
        components.push({
          name: getCategoryAdjustmentScent(oppositeCategory, false),
          ratio: 10, // 10% 할당
          category: oppositeCategory
        });
      }
      // maintain은 변화 없음
    });
  }
  
  // 향 특성 조정
  if (feedback.userCharacteristics) {
    Object.entries(feedback.userCharacteristics).forEach(([characteristic, value]) => {
      if (value !== 'medium') {
        const { name, ratio, category } = getCharacteristicAdjustment(
          characteristic as any, 
          value as any
        );
        components.push({ name, ratio, category });
      }
    });
  }
  
  return components;
}

/**
 * 카테고리 조정을 위한 향료 선택
 */
function getCategoryAdjustmentScent(category: PerfumeCategory, isIncrease: boolean): string {
  // 카테고리별 향료 매핑
  const categoryAdjustmentScents: Record<PerfumeCategory, [string, string]> = {
    citrus: ['베르가못', '레몬'],
    floral: ['로즈', '자스민'],
    woody: ['샌달우드', '시더우드'],
    musky: ['머스크', '앰버'],
    fruity: ['복숭아', '블랙베리'],
    spicy: ['핑크페퍼', '진저']
  };
  
  // 증가/감소에 따라 다른 향료 선택
  return categoryAdjustmentScents[category][isIncrease ? 0 : 1];
}

/**
 * 상반되는 카테고리 가져오기
 */
function getOppositeCategory(category: PerfumeCategory): PerfumeCategory {
  const opposites: Record<PerfumeCategory, PerfumeCategory> = {
    citrus: 'woody',
    floral: 'spicy',
    woody: 'citrus',
    musky: 'fruity',
    fruity: 'musky',
    spicy: 'floral'
  };
  return opposites[category] || 'woody';
}

/**
 * 향 특성 조정을 위한 향료 및 비율 가져오기
 */
function getCharacteristicAdjustment(
  characteristic: 'weight' | 'sweetness' | 'freshness' | 'uniqueness',
  value: 'veryLow' | 'low' | 'high' | 'veryHigh'
): { name: string; ratio: number; category: PerfumeCategory } {
  // 특성에 따른 향료 및 카테고리 매핑
  const characteristicMap = {
    weight: {
      low: { name: '시트러스 블렌드', category: 'citrus' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '베르가못', category: 'citrus' as PerfumeCategory, ratio: 15 },
      high: { name: '샌달우드', category: 'woody' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '앰버 블렌드', category: 'musky' as PerfumeCategory, ratio: 15 }
    },
    sweetness: {
      low: { name: '우디 블렌드', category: 'woody' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '시더우드', category: 'woody' as PerfumeCategory, ratio: 15 },
      high: { name: '바닐라', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '허니 블렌드', category: 'fruity' as PerfumeCategory, ratio: 15 }
    },
    freshness: {
      low: { name: '앰버 블렌드', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '스파이스 블렌드', category: 'spicy' as PerfumeCategory, ratio: 15 },
      high: { name: '시트러스 블렌드', category: 'citrus' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '민트 블렌드', category: 'citrus' as PerfumeCategory, ratio: 15 }
    },
    uniqueness: {
      low: { name: '머스크 블렌드', category: 'musky' as PerfumeCategory, ratio: 10 },
      veryLow: { name: '앰버', category: 'musky' as PerfumeCategory, ratio: 15 },
      high: { name: '이국적 블렌드', category: 'spicy' as PerfumeCategory, ratio: 10 },
      veryHigh: { name: '스모키 블렌드', category: 'woody' as PerfumeCategory, ratio: 15 }
    }
  };
  
  return characteristicMap[characteristic][value];
}

/**
 * 사용자가 요청한 특정 향료 처리
 */
function getSpecificScentComponents(feedback: PerfumeFeedback): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  const components: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }> = [];
  
  if (feedback.specificScents && feedback.specificScents.length > 0) {
    feedback.specificScents.forEach(scent => {
      if (scent.action === 'add' && scent.ratio) {
        // 카테고리 추정
        const category = estimateScentCategory(scent.name);
        
        // 비율 적용 (최대 30%까지 반올림)
        const ratio = Math.min((scent.ratio / 100) * 30, 30);
        
        components.push({
          name: scent.name,
          ratio,
          category
        });
      }
    });
  }
  
  return components;
}

/**
 * 향료 이름으로 카테고리 추정
 */
function estimateScentCategory(name: string): PerfumeCategory {
  const lowerName = name.toLowerCase();
  
  if (/레몬|오렌지|베르가못|라임|자몽|시트러스/.test(lowerName)) {
    return 'citrus';
  }
  if (/장미|로즈|자스민|라벤더|튤립|꽃|플로럴/.test(lowerName)) {
    return 'floral';
  }
  if (/우디|샌달우드|시더|나무|흙|이끼|파인/.test(lowerName)) {
    return 'woody';
  }
  if (/머스크|앰버|바닐라|통카|머스크|따뜻/.test(lowerName)) {
    return 'musky';
  }
  if (/복숭아|딸기|베리|과일|망고|프루티/.test(lowerName)) {
    return 'fruity';
  }
  if (/페퍼|시나몬|진저|카다멈|스파이시|후추/.test(lowerName)) {
    return 'spicy';
  }
  
  // 기본값
  return 'woody';
}

/**
 * 향료 비율 정규화 (모든 비율의 합을 100%로 만들기)
 */
function normalizeScents(scents: Array<{ name: string; ratio: number; category: PerfumeCategory }>): Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}> {
  // 총 비율 계산
  const totalRatio = scents.reduce((sum, scent) => sum + scent.ratio, 0);
  
  // 0이면 기본값 반환
  if (totalRatio === 0) {
    return [{ name: '기본 블렌드', ratio: 100, category: 'woody' }];
  }
  
  // 비율 정규화
  return scents.map(scent => ({
    ...scent,
    ratio: (scent.ratio / totalRatio) * 100
  }));
}

/**
 * 레시피 계산 (향료 g 단위로 변환)
 */
function calculateRecipe(scents: Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}>, totalGrams: number): Array<{
  name: string;
  amount: string;
  percentage: number;
}> {
  return scents.map(scent => ({
    name: scent.name,
    amount: `${((scent.ratio / 100) * totalGrams).toFixed(2)}g`,
    percentage: Math.round(scent.ratio)
  }));
}

/**
 * 시향 테스트 가이드 생성
 */
function generateTestGuide(scents: Array<{
  name: string;
  ratio: number;
  category: PerfumeCategory;
}>, feedback?: PerfumeFeedback, perfume?: PerfumePersona): {
  instructions: string;
  scentMixtures: Array<{ id: string; name: string; count: number; ratio: number }>;
} {
  // 향료 이름을 ID로 변환하는 유틸리티 함수 임포트
  const { formatScentCode, findScentIdByName, findScentNameById } = require('@/app/components/feedback/utils/formatters');
  
  // 선택된 향료 목록 준비
  let selectedScents = [...scents];
  
  // 1. 기본 향수를 첫 번째 항목으로 포함 (perfume이 제공된 경우)
  if (perfume) {
    // 기존 selectedScents에서 기본 향수가 있는지 확인
    const baseExists = selectedScents.find(s => s.name === perfume.name);
    
    // 없으면 기본 향수 추가 (유지 비율에 따라)
    if (!baseExists) {
      const retentionRatio = (feedback?.retentionPercentage ?? 50) / 100;
      selectedScents.unshift({
        name: perfume.name,
        ratio: 50 * retentionRatio, // 기본 비율의 50%를 기본 향수에 할당
        category: 'woody' as PerfumeCategory // 기본값
      });
    }
  }
  
  // 2. 사용자가 선택한 특정 향료 처리 (최대 2개)
  if (feedback?.specificScents && feedback.specificScents.length > 0) {
    feedback.specificScents.forEach(specificScent => {
      if (specificScent.action === 'add' && specificScent.name) {
        // 이미 선택된 향료 목록에 있는지 확인
        const existingIndex = selectedScents.findIndex(s => 
          s.name === specificScent.name || formatScentCode(s.name) === formatScentCode(specificScent.name)
        );
        
        if (existingIndex === -1) {
          // 없으면 새로 추가
          selectedScents.push({
            name: specificScent.name,
            ratio: specificScent.ratio || 50, // 기본값 50
            category: specificScent.category || 'woody' as PerfumeCategory
          });
        } else {
          // 있으면 비율 업데이트
          selectedScents[existingIndex].ratio = specificScent.ratio || selectedScents[existingIndex].ratio;
        }
      }
    });
  }
  
  // 3. 상위 3개 향료만 선택 (비율순)
  // 최대 향료 개수를 3개로 제한 (기본 향 + 최대 2개 추가)
  const topScents = selectedScents
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);
  
  // 4. 향료 비율 재정규화
  const totalTopRatio = topScents.reduce((sum, scent) => sum + scent.ratio, 0);
  
  // 5. 알갱이 개수 계산 및 ID 매핑
  const scentMixtures = topScents.map(scent => {
    // 향료 ID 찾기
    const id = formatScentCode(scent.name);
    const name = scent.name;
    
    // 비율 계산 (0-100%)
    const ratio = Math.round((scent.ratio / totalTopRatio) * 100);
    
    // 알갱이 개수 계산 (비율에 따라 1-10개 사이의 정수)
    // 알갱이 개수 = 비율 / 10 (반올림, 최소 1개, 최대 10개)
    const count = Math.max(1, Math.min(10, Math.round(ratio / 10)));
    
    return {
      id,
      name,
      count,
      ratio
    };
  });
  
  // 6. 테스트 방법 설명 생성
  // 알갱이 목록 텍스트 생성
  const granulesList = scentMixtures.map(scent => `${scent.id} ${scent.count}알`).join(', ');
  
  // 비율 목록 텍스트 생성
  const ratiosList = scentMixtures.map(scent => `${scent.name} (${scent.id}) ${scent.ratio}%`).join(', ');
  
  // 최종 안내 텍스트
  const instructions = `
다음과 같이 향료 알갱이를 준비하여 시향해보세요:
${granulesList}

알갱이들을 작은 용기에 함께 넣고 섞어서 완성된 향의 조합을 경험해보세요.
각 향료의 비율은 ${ratiosList} 입니다.

이 테스팅 레시피는 향수 제작 전 시향(향 테스트)을 위한 것입니다.
  `.trim();
  
  return {
    instructions,
    scentMixtures
  };
}

/**
 * 레시피 설명 생성
 */
function generateExplanation(
  feedback: PerfumeFeedback, 
  scents: Array<{
    name: string;
    ratio: number;
    category: PerfumeCategory;
  }>,
  perfume: PerfumePersona
): {
  rationale: string;
  expectedResult: string;
  recommendation: string;
} {
  // 주요 카테고리 파악
  const categoryRatios: Record<PerfumeCategory, number> = {
    citrus: 0,
    floral: 0,
    woody: 0,
    musky: 0,
    fruity: 0,
    spicy: 0
  };
  
  // 카테고리별 비율 합산
  scents.forEach(scent => {
    categoryRatios[scent.category] += scent.ratio;
  });
  
  // 상위 2개 카테고리 파악
  const topCategories = Object.entries(categoryRatios)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([category]) => category as PerfumeCategory);
  
  // 카테고리 한글 이름
  const categoryDisplayNames: Record<PerfumeCategory, string> = {
    citrus: '시트러스',
    floral: '플로럴',
    woody: '우디',
    musky: '머스크',
    fruity: '프루티',
    spicy: '스파이시'
  };
  
  // 계절 추천
  const seasonRecommendation = getSeasonRecommendation(topCategories);
  
  // 설명 생성
  const rationale = `
${perfume.name} 향수를 기반으로 하여, ${feedback.retentionPercentage || 50}%의 기존 향을 유지하면서 
사용자의 피드백에 따라 ${topCategories.map(c => categoryDisplayNames[c]).join('과 ')} 노트를 
강조했습니다. ${getSpecificScentExplanation(feedback)}
  `.trim();
  
  // 예상되는 향의 특징
  const expectedResult = `
이 조합은 ${getCategoryDescription(topCategories[0])}와(과) ${getCategoryDescription(topCategories[1])}가 
조화롭게 어우러진 향을 제공합니다. ${getCharacteristicsExplanation(feedback)}
  `.trim();
  
  // 추천 사항
  const recommendation = `
이 향수는 ${seasonRecommendation}에 특히 잘 어울립니다. ${getOccasionRecommendation(topCategories)}
  `.trim();
  
  return {
    rationale,
    expectedResult,
    recommendation
  };
}

/**
 * 특정 향료 설명 생성
 */
function getSpecificScentExplanation(feedback: PerfumeFeedback): string {
  if (!feedback.specificScents || feedback.specificScents.length === 0) {
    return '';
  }
  
  const addedScents = feedback.specificScents
    .filter(s => s.action === 'add')
    .map(s => s.name);
  
  if (addedScents.length === 0) {
    return '';
  }
  
  return `특별히 요청하신 ${addedScents.join(', ')} 향료를 추가하여 개성을 더했습니다.`;
}

/**
 * 향 특성 설명 생성
 */
function getCharacteristicsExplanation(feedback: PerfumeFeedback): string {
  if (!feedback.userCharacteristics) {
    return '';
  }
  
  const characteristics = [];
  
  if (feedback.userCharacteristics.weight === 'high' || feedback.userCharacteristics.weight === 'veryHigh') {
    characteristics.push('무게감 있는');
  } else if (feedback.userCharacteristics.weight === 'low' || feedback.userCharacteristics.weight === 'veryLow') {
    characteristics.push('가벼운');
  }
  
  if (feedback.userCharacteristics.sweetness === 'high' || feedback.userCharacteristics.sweetness === 'veryHigh') {
    characteristics.push('달콤한');
  } else if (feedback.userCharacteristics.sweetness === 'low' || feedback.userCharacteristics.sweetness === 'veryLow') {
    characteristics.push('건조한');
  }
  
  if (feedback.userCharacteristics.freshness === 'high' || feedback.userCharacteristics.freshness === 'veryHigh') {
    characteristics.push('청량한');
  } else if (feedback.userCharacteristics.freshness === 'low' || feedback.userCharacteristics.freshness === 'veryLow') {
    characteristics.push('따뜻한');
  }
  
  if (feedback.userCharacteristics.uniqueness === 'high' || feedback.userCharacteristics.uniqueness === 'veryHigh') {
    characteristics.push('독특한');
  } else if (feedback.userCharacteristics.uniqueness === 'low' || feedback.userCharacteristics.uniqueness === 'veryLow') {
    characteristics.push('부드러운');
  }
  
  if (characteristics.length === 0) {
    return '';
  }
  
  return `특히 ${characteristics.join(', ')} 특성이 두드러집니다.`;
}

/**
 * 카테고리 설명 가져오기
 */
function getCategoryDescription(category: PerfumeCategory): string {
  const descriptions: Record<PerfumeCategory, string> = {
    citrus: '상쾌하고 활기찬 시트러스 향',
    floral: '우아하고 여성스러운 꽃향기',
    woody: '깊고 따뜻한 나무의 향',
    musky: '포근하고 관능적인 머스크 향',
    fruity: '달콤하고 즙이 많은 과일 향',
    spicy: '자극적이고 강렬한 스파이시 향'
  };
  
  return descriptions[category];
}

/**
 * 계절 추천 가져오기
 */
function getSeasonRecommendation(categories: PerfumeCategory[]): string {
  // 카테고리별 계절 추천
  const seasonMap: Record<PerfumeCategory, string[]> = {
    citrus: ['봄', '여름'],
    floral: ['봄', '여름'],
    woody: ['가을', '겨울'],
    musky: ['가을', '겨울'],
    fruity: ['봄', '여름'],
    spicy: ['가을', '겨울']
  };
  
  // 상위 2개 카테고리의 계절 조합
  const seasons = new Set<string>();
  categories.forEach(category => {
    seasonMap[category].forEach(season => seasons.add(season));
  });
  
  return Array.from(seasons).join('과 ');
}

/**
 * 상황 추천 가져오기
 */
function getOccasionRecommendation(categories: PerfumeCategory[]): string {
  const occasions: Record<PerfumeCategory, string[]> = {
    citrus: ['일상적인 활동', '스포츠 활동', '야외 행사'],
    floral: ['데이트', '결혼식', '사교 모임'],
    woody: ['사무실', '비즈니스 미팅', '정장을 입는 자리'],
    musky: ['저녁 약속', '특별한 밤', '로맨틱한 자리'],
    fruity: ['캐주얼한 모임', '쇼핑', '친구와의 만남'],
    spicy: ['중요한 프레젠테이션', '격식 있는 자리', '파티']
  };
  
  // 주요 카테고리에 따른 추천
  const mainCategory = categories[0];
  const occasionList = occasions[mainCategory];
  
  return `${occasionList[0]}이나 ${occasionList[1]}에 사용하기 좋으며, 특히 ${occasionList[2]}에 사용하면 좋은 인상을 줄 수 있습니다.`;
}

/**
 * 레시피 특성 가져오기
 */
function getRecipeCharacteristic(feedback: PerfumeFeedback): string {
  if (!feedback.userCharacteristics) {
    return '균형 잡힌';
  }
  
  // 두드러진 특성 찾기
  const extremeCharacteristics = Object.entries(feedback.userCharacteristics)
    .filter(([, value]) => value === 'veryHigh' || value === 'veryLow')
    .map(([char]) => char);
  
  if (extremeCharacteristics.length === 0) {
    return '균형 잡힌';
  }
  
  // 특성에 따른 설명
  const characteristicDescriptions: Record<string, string> = {
    weight: feedback.userCharacteristics.weight === 'veryHigh' ? '무게감 있는' : '가벼운',
    sweetness: feedback.userCharacteristics.sweetness === 'veryHigh' ? '달콤한' : '건조한',
    freshness: feedback.userCharacteristics.freshness === 'veryHigh' ? '청량한' : '따뜻한',
    uniqueness: feedback.userCharacteristics.uniqueness === 'veryHigh' ? '독특한' : '편안한'
  };
  
  // 첫 번째 극단적 특성 사용
  return characteristicDescriptions[extremeCharacteristics[0]];
} 