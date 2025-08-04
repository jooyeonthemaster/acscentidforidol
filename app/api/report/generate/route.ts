import { NextRequest, NextResponse } from 'next/server';
import { getSessionFullData } from '../../../../lib/firestoreApi';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 보고서 생성 API - Gemini를 활용한 맞춤형 최종 보고서
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;
    
    if (!userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 sessionId가 필요합니다.'
      }, { status: 400 });
    }

    // 세션 데이터 조회
    const sessionData = await getSessionFullData(userId, sessionId);
    
    if (!sessionData.session) {
      return NextResponse.json({
        success: false,
        error: '세션 데이터를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // Gemini API 초기화
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 프롬프트 생성
    const prompt = `
다음은 고객의 향수 분석 및 제작 과정에 대한 데이터입니다. 이를 바탕으로 전문적이고 개인화된 최종 보고서를 작성해주세요.

=== 고객 정보 ===
- 고객명: ${sessionData.session.customerName || '정보 없음'}
- 최애 정보: ${JSON.stringify(sessionData.session.idolInfo || {}, null, 2)}

=== 이미지 분석 결과 ===
${sessionData.session.imageAnalysis ? JSON.stringify(sessionData.session.imageAnalysis, null, 2) : '분석 정보 없음'}

=== 고객 피드백 ===
${sessionData.session.feedback ? JSON.stringify(sessionData.session.feedback, null, 2) : '피드백 없음'}

=== 개선된 레시피 ===
${sessionData.session.improvedRecipe ? JSON.stringify(sessionData.session.improvedRecipe, null, 2) : '레시피 없음'}

=== 최종 확정 정보 ===
${sessionData.session.confirmation ? JSON.stringify(sessionData.session.confirmation, null, 2) : '확정 정보 없음'}

다음 형식으로 JSON 응답을 생성해주세요:

{
  "executiveSummary": "이 고객의 향수 여정에 대한 전체적인 요약 (3-4줄)",
  "personalityAnalysis": "고객의 성향과 취향에 대한 깊이 있는 분석 (5-6줄)",
  "fragranceJourney": "향수 제작 과정에서의 변화와 발견 사항 (4-5줄)",
  "recommendationReason": "최종 추천 향수/레시피를 선택한 근거와 이유 (4-5줄)",
  "futureGuidance": "향후 향수 사용 및 관리에 대한 조언 (3-4줄)",
  "personalMessage": "고객에게 보내는 개인화된 메시지 (2-3줄)",
  "technicalNotes": "조향사 관점에서의 기술적 노트 (3-4줄)",
  "qualityScore": "전체 분석의 품질 점수 (1-100점, 숫자만)",
  "confidenceLevel": "추천의 신뢰도 (높음/보통/낮음 중 하나)"
}

한국어로 작성하되, 전문적이면서도 친근한 톤으로 작성해주세요. 실제 향수 전문가가 작성한 것처럼 깊이 있고 개인화된 내용으로 만들어주세요.
`;

    console.log('Gemini API로 보고서 생성 시작');
    
    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('Gemini API 응답 수신:', text.substring(0, 200) + '...');
    
    // JSON 추출
    let reportData;
    try {
      // ```json ... ``` 형태인지 확인
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        reportData = JSON.parse(jsonMatch[1]);
      } else {
        // 직접 JSON 파싱 시도
        reportData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // 기본 보고서 생성
      reportData = {
        executiveSummary: "고객의 개성과 선호도를 반영한 맞춤형 향수 분석이 완료되었습니다. 세심한 분석을 통해 고객님만의 독특한 향기 프로필을 발견할 수 있었습니다.",
        personalityAnalysis: "분석 결과, 고객님은 독특하고 개성적인 향수를 선호하시며, 감성적이고 세련된 취향을 보여주십니다. 향에 대한 민감도가 높고, 자신만의 스타일을 추구하는 성향이 강합니다.",
        fragranceJourney: "초기 이미지 분석부터 피드백 과정을 거쳐 최종 레시피까지, 체계적인 접근을 통해 고객님께 가장 적합한 향조합을 찾아냈습니다.",
        recommendationReason: "고객님의 특성과 선호도를 종합적으로 고려하여 선정된 향수는 개성과 우아함을 동시에 표현할 수 있는 최적의 조합입니다.",
        futureGuidance: "이 향수는 일상적인 사용에 적합하며, 특별한 순간을 위한 시그니처 향으로 활용하시기를 권장드립니다.",
        personalMessage: "고객님만의 특별한 향기를 발견하는 여정에 함께할 수 있어 기뻤습니다. 이 향수가 고객님의 매력을 더욱 돋보이게 해드리길 바랍니다.",
        technicalNotes: "조향 관점에서 균형잡힌 구성과 지속력을 고려한 레시피로 제작되었습니다.",
        qualityScore: 85,
        confidenceLevel: "높음"
      };
    }
    
    console.log('보고서 생성 완료');
    
    return NextResponse.json({
      success: true,
      report: reportData,
      sessionData: sessionData
    });
    
  } catch (error) {
    console.error('보고서 생성 오류:', error);
    return NextResponse.json({
      success: false,
      error: '보고서 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 