import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '../../utils/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: '추천을 위한 정보가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // Gemini API를 통한 향수 추천 요청
    const response = await askGemini(prompt);
    
    return NextResponse.json({ recommendation: response });
  } catch (error) {
    console.error('추천 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}