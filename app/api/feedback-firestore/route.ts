import { NextRequest, NextResponse } from 'next/server';
import { saveSessionFeedback } from '../../../lib/firestoreApi';

/**
 * Firestore 버전 피드백 API
 * 기존 feedback API와 동일한 기능이지만 Firestore에 저장
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      feedbackData,
      // 하위 호환성을 위한 기존 필드들
      selectedCategories,
      ratings,
      improvements,
      comments
    } = body;

    console.log('🔥 Firestore 피드백 저장 시작:', { 
      userId, 
      sessionId, 
      hasData: !!feedbackData 
    });

    if (!userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 sessionId가 필요합니다.'
      }, { status: 400 });
    }

    // 피드백 데이터 정규화
    const normalizedFeedbackData = feedbackData || {
      selectedCategories: selectedCategories || [],
      ratings: ratings || {},
      improvements: improvements || {},
      comments: comments || '',
      submittedAt: new Date().toISOString()
    };

    console.log('📝 피드백 데이터 구조:', {
      categoriesCount: normalizedFeedbackData.selectedCategories?.length || 0,
      ratingsCount: Object.keys(normalizedFeedbackData.ratings || {}).length,
      improvementsCount: Object.keys(normalizedFeedbackData.improvements || {}).length,
      hasComments: !!normalizedFeedbackData.comments
    });

    // Firestore에 피드백 저장
    const result = await saveSessionFeedback(userId, sessionId, normalizedFeedbackData);

    console.log('✅ Firestore 피드백 저장 완료:', result.feedbackId);

    return NextResponse.json({
      success: true,
      message: 'Firestore에 피드백이 성공적으로 저장되었습니다.',
      feedbackId: result.feedbackId,
      sessionUpdated: result.sessionUpdated,
      source: 'firestore',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Firestore 피드백 저장 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 피드백 저장 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}

// 피드백 조회 API (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId가 필요합니다.'
      }, { status: 400 });
    }

    console.log('🔍 Firestore 피드백 조회:', { userId, sessionId });

    // Firestore에서 피드백 조회
    // 실제로는 FeedbackModel.getBySession 같은 메서드 구현 필요
    const { getFeedbacksBySession } = await import('../../../lib/firestoreApi');
    
    // 임시로 빈 배열 반환 (실제 구현 필요)
    const feedbacks = [];

    return NextResponse.json({
      success: true,
      data: feedbacks,
      source: 'firestore',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Firestore 피드백 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore 피드백 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}