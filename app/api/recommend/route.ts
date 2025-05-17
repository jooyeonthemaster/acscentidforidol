import { NextRequest, NextResponse } from 'next/server';
import { recommendPerfume } from '@/utils/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, history, idolInfo } = body;

    if (!image) {
      return NextResponse.json(
        { error: '이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 요청에 최애 정보 추가
    let enhancedHistory = [...history];
    
    // 최애 정보가 있으면 대화 기록에 첨부
    if (idolInfo && Object.keys(idolInfo).length > 0) {
      enhancedHistory.unshift({
        role: 'system',
        parts: `최애 정보: 이름(${idolInfo.idolName}), 그룹(${idolInfo.idolGroup}), 스타일(${idolInfo.idolStyle}), 성격(${idolInfo.idolPersonality}), 매력 포인트(${idolInfo.idolCharms})`
      });
    }

    // Gemini API로 향수 추천 받기
    const response = await recommendPerfume(image, enhancedHistory);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('향수 추천 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}