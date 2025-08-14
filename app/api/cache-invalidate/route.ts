import { NextRequest, NextResponse } from 'next/server';
import { 
  invalidateAdminCache, 
  invalidateSessionCache,
  clearAllCache,
  getCacheStats 
} from '../../../lib/cacheManager';

/**
 * 캐시 무효화 전용 API 엔드포인트
 * 실시간 데이터 반영을 위한 캐시 관리
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, sessionId } = body;
    
    let result = {};
    
    switch (action) {
      case 'invalidate-admin':
        // 관리자 페이지 캐시 무효화
        const adminInvalidated = invalidateAdminCache();
        result = {
          action: 'invalidate-admin',
          invalidatedCount: adminInvalidated,
          message: `관리자 캐시 ${adminInvalidated}개 항목 무효화 완료`
        };
        break;
        
      case 'invalidate-session':
        // 특정 세션 관련 캐시 무효화
        if (!userId || !sessionId) {
          return NextResponse.json({
            success: false,
            error: 'userId와 sessionId가 필요합니다.'
          }, { status: 400 });
        }
        
        const sessionInvalidated = invalidateSessionCache(userId, sessionId);
        result = {
          action: 'invalidate-session',
          userId,
          sessionId,
          invalidatedCount: sessionInvalidated,
          message: `세션 캐시 ${sessionInvalidated}개 항목 무효화 완료`
        };
        break;
        
      case 'clear-all':
        // 전체 캐시 초기화
        const allCleared = clearAllCache();
        result = {
          action: 'clear-all',
          clearedCount: allCleared,
          message: `전체 캐시 ${allCleared}개 항목 초기화 완료`
        };
        break;
        
      case 'get-stats':
        // 캐시 상태 조회
        const stats = getCacheStats();
        result = {
          action: 'get-stats',
          stats,
          message: '캐시 통계 조회 완료'
        };
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: '지원하지 않는 액션입니다.',
          supportedActions: ['invalidate-admin', 'invalidate-session', 'clear-all', 'get-stats']
        }, { status: 400 });
    }
    
    console.log(`🗑️ 캐시 관리 작업 완료: ${action}`, result);
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ 캐시 무효화 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '캐시 무효화 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// GET 요청으로 캐시 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';
    
    const stats = getCacheStats();
    
    return NextResponse.json({
      success: true,
      stats: includeDetails ? stats : {
        totalEntries: stats.totalEntries,
        totalSize: stats.totalSize
      },
      message: '캐시 상태 조회 완료',
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ 캐시 상태 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '캐시 상태 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
