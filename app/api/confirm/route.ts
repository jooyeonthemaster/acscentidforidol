import { NextRequest, NextResponse } from 'next/server';
import { confirmPerfume } from '../../../lib/firebaseApi';

/**
 * 향수 확정 API 엔드포인트
 * 
 * 고객이 테스팅을 마치고 최종적으로 향수를 확정하는 단계
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      finalRating,
      finalComments,
      confirmedRecipe,
      orderQuantity,
      customizations 
    } = body;
    
    // 필수 필드 검증
    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'userId와 sessionId가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 확정 데이터 구성
    const confirmationData = {
      finalRating: finalRating || null,
      finalComments: finalComments || '',
      confirmedRecipe: confirmedRecipe || null,
      orderQuantity: orderQuantity || '10ml',
      customizations: customizations || {},
      confirmedAt: new Date().toISOString(),
    };
    
    // Firebase에 향수 확정 정보 저장
    const result = await confirmPerfume(userId, sessionId, confirmationData);
    
    return NextResponse.json({
      success: true,
      message: '향수가 성공적으로 확정되었습니다.',
      confirmationId: result.confirmationId,
      sessionCompleted: result.sessionCompleted
    });
    
  } catch (error) {
    console.error('향수 확정 API 오류:', error);
    return NextResponse.json(
      { error: '향수 확정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}