import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '@/utils/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, idolInfo } = body;

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );   
    }

    // 최애 정보가 있는 경우, 프롬프트에 추가
    let enrichedMessage = message;
    
    if (idolInfo && Object.keys(idolInfo).length > 0) {
      enrichedMessage = `
다음은 사용자가 입력한 최애 아이돌에 대한 정보입니다:
- 이름: ${idolInfo.idolName || '정보 없음'}
- 그룹: ${idolInfo.idolGroup || '정보 없음'}
- 스타일: ${idolInfo.idolStyle || '정보 없음'}
- 성격: ${idolInfo.idolPersonality || '정보 없음'}
- 매력 포인트: ${idolInfo.idolCharms || '정보 없음'}

     
위 정보를 참고하여 대화를 이어나가주세요. 하지만 모든 응답에 위 정보를 다 언급하지 말고, 자연스럽게 대화해주세요.
`;
    }

    // Gemini API에 질문하기
    const response = await askGemini(enrichedMessage, history);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}