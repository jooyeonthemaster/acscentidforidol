import { NextRequest, NextResponse } from 'next/server';
import { 
  getSessionsOptimized, 
  getSessionFullData, 
  getPerformanceStats 
} from '../../../lib/firestoreApi';

/**
 * Firestore 관리자용 API 엔드포인트
 * 
 * GET: Firestore 세션 목록 조회 - 진짜 페이지네이션 지원
 * POST: 특정 세션의 상세 데이터 조회 (보고서용)
 */

// 메모리 캐시 - 5초간 유지 (테스트용 짧은 캐시)
const cache = new Map();
const CACHE_DURATION = 5 * 1000; // 5초

function getCacheKey(page: number, pageSize: number, statusFilter: string) {
  return `firestore_sessions_${page}_${pageSize}_${statusFilter}`;
}

function isValidCache(cacheEntry: any) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
}

// Firestore 세션 목록 조회 - 진짜 페이지네이션
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const statusFilter = searchParams.get('status') || 'all';
    
    console.log(`🔥 Firestore 관리자 API: 데이터 조회 시작 - 페이지: ${page}, 사이즈: ${pageSize}, 필터: ${statusFilter}`);
    
    // 캐시 확인
    const cacheKey = getCacheKey(page, pageSize, statusFilter);
    const cached = cache.get(cacheKey);
    
    if (isValidCache(cached)) {
      console.log('⚡ Firestore 관리자 API: 캐시에서 데이터 반환');
      return NextResponse.json({
        success: true,
        cached: true,
        source: 'firestore',
        ...cached.data
      });
    }
    
    // Firestore에서 최적화된 조회
    const paginatedData = await getSessionsOptimized(
      page, 
      pageSize, 
      statusFilter === 'all' ? null : statusFilter
    );
    
    // 성능 통계도 함께 제공
    const performanceStats = await getPerformanceStats();
    
    const responseData = {
      ...paginatedData,
      performanceStats,
      source: 'firestore',
      queryTime: Date.now()
    };
    
    // 캐시에 저장
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    console.log(`✅ Firestore 관리자 API: 조회 완료 - ${paginatedData.sessions.length}개/${paginatedData.totalSessions}개 세션`);
    
    return NextResponse.json({
      success: true,
      cached: false,
      ...responseData
    });
    
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

// 성능 비교를 위한 추가 엔드포인트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'clearCache') {
      cache.clear();
      return NextResponse.json({
        success: true,
        message: 'Firestore 캐시가 초기화되었습니다.',
        source: 'firestore'
      });
    }
    
    if (action === 'getStats') {
      const stats = await getPerformanceStats();
      return NextResponse.json({
        success: true,
        data: stats,
        source: 'firestore'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '알 수 없는 액션입니다.'
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