import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { ref, update } from 'firebase/database';

/**
 * AI 보고서 캐시 API - 생성된 보고서를 Firebase에 저장
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, generatedReport } = body;
    
    if (!userId || !sessionId || !generatedReport) {
      return NextResponse.json({
        success: false,
        error: 'userId, sessionId, generatedReport가 필요합니다.'
      }, { status: 400 });
    }

    console.log('AI 보고서 캐시 저장 시작:', { userId, sessionId });

    // Firebase에 생성된 보고서 저장
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      generatedReport: generatedReport,
      reportGeneratedAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('AI 보고서 캐시 저장 완료');

    return NextResponse.json({
      success: true,
      message: 'AI 보고서가 성공적으로 캐시되었습니다.'
    });

  } catch (error) {
    console.error('AI 보고서 캐시 저장 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'AI 보고서 캐시 저장 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 