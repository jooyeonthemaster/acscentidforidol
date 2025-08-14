import { NextRequest, NextResponse } from 'next/server';
import { 
  getSessionsOptimized, 
  getSessionFullData, 
  getPerformanceStats 
} from '../../../lib/firestoreApi';
import { 
  getFromCache, 
  setCache, 
  getCacheKey, 
  CACHE_TTL,
  clearAllCache,
  createCachedResponse,
  getCacheStats 
} from '../../../lib/cacheManager';

/**
 * Firestore 관리자용 API 엔드포인트
 * 
 * GET: Firestore 세션 목록 조회 - 진짜 페이지네이션 지원
 * POST: 특정 세션의 상세 데이터 조회 (보고서용)
 * PATCH: 캐시 관리 (초기화, 통계 조회)
 */

// Firestore 세션 목록 조회 - 최적화된 캐시와 페이지네이션
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const statusFilter = searchParams.get('status') || 'all';
    
    console.log(`🔥 Firestore 관리자 API: 데이터 조회 시작 - 페이지: ${page}, 사이즈: ${pageSize}, 필터: ${statusFilter}`);
    
    // 새로운 캐시 시스템 사용
    const cacheKey = getCacheKey.adminSessions(page, pageSize, statusFilter);
    const cachedData = getFromCache(cacheKey, CACHE_TTL.ADMIN_SESSIONS);
    
    if (cachedData) {
      console.log('⚡ Firestore 관리자 API: 캐시에서 데이터 반환');
      return createCachedResponse(cachedData, true, 'firestore');
    }
    
    // 병렬로 데이터와 통계 조회 (성능 최적화)
    const [paginatedData, performanceStats] = await Promise.all([
      getSessionsOptimized(page, pageSize, statusFilter === 'all' ? null : statusFilter),
      getPerformanceStats()
    ]);
    
    const responseData = {
      ...paginatedData,
      performanceStats,
      source: 'firestore',
      queryTime: Date.now()
    };
    
    // 새로운 캐시 시스템에 저장
    setCache(cacheKey, responseData, CACHE_TTL.ADMIN_SESSIONS);
    
    console.log(`✅ Firestore 관리자 API: 조회 완료 - ${paginatedData.sessions.length}개/${paginatedData.totalSessions}개 세션`);
    
    return createCachedResponse(responseData, false, 'firestore');
    
  } catch (error) {
    console.error('❌ Firestore 관리자 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Firestore 데이터 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}

// 특정 세션의 상세 데이터 조회 (보고서용) - Firestore 버전
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;
    
    console.log(`🔥 Firestore 관리자 API: 세션 상세 조회 - ${userId}/${sessionId}`);
    
    if (!userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 sessionId가 필요합니다.'
      }, { status: 400 });
    }
    
    const sessionData = await getSessionFullData(userId, sessionId);
    
    // 응답 데이터 포맷팅
    const responseData = {
      ...sessionData,
      formattedPhone: userId,
      userId: userId,
      sessionId: sessionId,
      source: 'firestore'
    };
    
    console.log('✅ Firestore 관리자 API: 세션 상세 데이터 조회 완료');
    
    return NextResponse.json({
      success: true,
      data: responseData,
      source: 'firestore'
    });
    
  } catch (error) {
    console.error('❌ Firestore 세션 상세 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Firestore 세션 데이터 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      source: 'firestore'
    }, { status: 500 });
  }
}

// 캐시 관리 및 성능 모니터링 엔드포인트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'clearCache') {
      const clearedCount = clearAllCache();
      return NextResponse.json({
        success: true,
        message: `Firestore 캐시가 초기화되었습니다. (${clearedCount}개 항목 삭제)`,
        source: 'firestore',
        clearedCount
      });
    }
    
    if (action === 'getStats') {
      const [performanceStats, cacheStats] = await Promise.all([
        getPerformanceStats(),
        Promise.resolve(getCacheStats())
      ]);
      
      return NextResponse.json({
        success: true,
        data: {
          performance: performanceStats,
          cache: cacheStats
        },
        source: 'firestore'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '알 수 없는 액션입니다. 지원되는 액션: clearCache, getStats'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Firestore 관리자 액션 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'Firestore 액션 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}