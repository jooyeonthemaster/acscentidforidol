import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '../../utils/gemini';
import { saveImprovedRecipe } from '../../../lib/firebaseApi';

/**
 * 개선된 향수 레시피 추천 API 엔드포인트
 * 
 * 피드백을 바탕으로 Gemini API를 통해 개선된 향수 레시피를 생성
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      sessionId,
      originalPerfume,
      feedback,
      adjustmentRecommendations,
      customPrompt
    } = body;
    
    // 필수 필드 검증
    if (!originalPerfume || !feedback) {
      return NextResponse.json(
        { error: '원본 향수 정보와 피드백이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // Gemini API용 프롬프트 생성
    const prompt = customPrompt || `
다음 향수에 대한 고객의 피드백을 바탕으로 개선된 향수 레시피를 추천해주세요:

원본 향수: ${originalPerfume.name}
원본 향수 특성: ${JSON.stringify(originalPerfume.persona || {})}

고객 피드백:
- 전체 평점: ${feedback.overallRating}/5
- 인상: ${feedback.impression || '없음'}
- 유지 비율: ${feedback.retentionPercentage || 100}%
- 카테고리 선호도: ${JSON.stringify(feedback.categoryPreferences || {})}
- 특성 평가: ${JSON.stringify(feedback.userCharacteristics || {})}
- 추가 의견: ${feedback.additionalComments || '없음'}

조정 추천사항: ${JSON.stringify(adjustmentRecommendations || {})}

다음 형식으로 개선된 레시피를 제안해주세요:
1. 10ml 레시피 (구체적인 향료와 양)
2. 50ml 레시피 (구체적인 향료와 양)
3. 테스팅 가이드 (어떻게 테스트할지)
4. 기대 효과 설명
5. 추천 사항

모든 측정은 ml 단위로 정확하게 제시하고, 실제 제작 가능한 레시피로 작성해주세요.
    `.trim();
    
    // Gemini API를 통한 레시피 추천 요청
    const recipeRecommendation = await askGemini(prompt);
    
    // 레시피 데이터 구성
    const recipeData = {
      originalPerfumeId: originalPerfume.id,
      originalPerfumeName: originalPerfume.name,
      feedbackSummary: {
        overallRating: feedback.overallRating,
        retentionPercentage: feedback.retentionPercentage,
        mainConcerns: feedback.additionalComments
      },
      improvedRecipe: recipeRecommendation,
      adjustmentRecommendations: adjustmentRecommendations,
      generatedAt: new Date().toISOString()
    };
    
    // Firebase에 레시피 저장
    if (userId && sessionId) {
      try {
        await saveImprovedRecipe(userId, sessionId, recipeData);
        console.log('Firebase에 개선된 레시피 저장 완료');
      } catch (firebaseError) {
        console.error('Firebase 레시피 저장 오류:', firebaseError);
        // Firebase 저장 실패해도 레시피는 반환
      }
    }
    
    return NextResponse.json({
      success: true,
      recipe: recipeData,
      recommendation: recipeRecommendation
    });
    
  } catch (error) {
    console.error('레시피 추천 API 오류:', error);
    return NextResponse.json(
      { error: '레시피 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}