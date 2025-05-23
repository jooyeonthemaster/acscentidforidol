import { NextRequest, NextResponse } from 'next/server';
import { testFirebaseConnection } from '../../../lib/firebaseTest';

/**
 * Firebase 연결 테스트 API
 */
export async function GET() {
  try {
    const result = await testFirebaseConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Firebase 연결이 정상적으로 작동합니다!',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Firebase 연결에 실패했습니다.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Firebase 테스트 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      message: 'Firebase 테스트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export async function POST() {
  // POST 요청도 같은 테스트 실행
  return GET();
}