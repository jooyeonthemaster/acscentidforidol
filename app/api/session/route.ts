import { NextRequest, NextResponse } from 'next/server';
import { 
  createPerfumeSession, 
  getPerfumeSession, 
  getUserSessions,
  saveImageAnalysisWithLink,
  saveSessionFeedback,
  saveImprovedRecipe
} from '../../../lib/firestoreApi';

/**
 * 향수 세션 관리 API 엔드포인트
 * 
 * POST: 새로운 세션 생성
 * GET: 세션 조회 (쿼리 파라미터로 userId, sessionId 전달)
 * PUT: 세션 업데이트 (이미지 분석, 피드백, 레시피 등)
 */

// 새로운 향수 세션 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, customerName, customerInfo } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const sessionData = {
      customerName: customerName || '고객',
      customerInfo: customerInfo || {},
      status: 'started'
    };
    
    const sessionId = await createPerfumeSession(userId, sessionData);
    
    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: '새로운 향수 세션이 생성되었습니다.'
    });
    
  } catch (error) {
    console.error('세션 생성 오류:', error);
    return NextResponse.json(
      { error: '세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 세션 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }
    
    let result;
    if (sessionId) {
      // 특정 세션 조회
      result = await getPerfumeSession(userId, sessionId);
    } else {
      // 사용자의 모든 세션 조회
      result = await getUserSessions(userId);
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('세션 조회 오류:', error);
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}// 세션 업데이트 (이미지 분석, 피드백, 레시피 등)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, updateType, data } = body;
    
    if (!userId || !sessionId || !updateType) {
      return NextResponse.json(
        { error: 'userId, sessionId, updateType이 필요합니다.' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (updateType) {
      case 'imageAnalysis':
        const { analysisData, imageUrl } = data;
        result = await saveImageAnalysisWithLink(userId, sessionId, analysisData, imageUrl);
        break;
        
      case 'feedback':
        result = await saveSessionFeedback(userId, sessionId, data);
        break;
        
      case 'recipe':
        result = await saveImprovedRecipe(userId, sessionId, data);
        break;
        
      default:
        return NextResponse.json(
          { error: '지원하지 않는 업데이트 타입입니다.' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      result: result,
      message: `세션이 성공적으로 업데이트되었습니다. (${updateType})`
    });
    
  } catch (error) {
    console.error('세션 업데이트 오류:', error);
    return NextResponse.json(
      { error: '세션 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}