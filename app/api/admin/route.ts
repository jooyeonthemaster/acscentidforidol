import { NextRequest, NextResponse } from 'next/server';
import { getAllUserData, getAllUserDataPaginated, getSessionsOptimized, getSessionFullData } from '../../../lib/firebaseApi';

/**
 * 관리자용 API 엔드포인트
 * 
 * GET: 모든 사용자 데이터 조회 (분석 내역 목록) - 페이지네이션 지원, 캐싱 추가
 * POST: 특정 세션의 상세 데이터 조회 (보고서용)
 */

// 간단한 메모리 캐시 (5분간 유지)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

function getCacheKey(page: number, pageSize: number) {
  return `admin_sessions_${page}_${pageSize}`;
}

function isValidCache(cacheEntry: any) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
}

// 모든 사용자 분석 세션 목록 조회 (관리자용) - 페이지네이션 지원, 캐싱 추가
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const useOptimized = searchParams.get('optimized') === 'true';
    
    console.log(`관리자 API: 데이터 조회 시작 - 페이지: ${page}, 사이즈: ${pageSize}, 최적화: ${useOptimized}`);
    
    // 캐시 확인
    const cacheKey = getCacheKey(page, pageSize);
    const cached = cache.get(cacheKey);
    
    if (isValidCache(cached)) {
      console.log('관리자 API: 캐시에서 데이터 반환');
      return NextResponse.json({
        success: true,
        cached: true,
        ...cached.data
      });
    }
    
    // 최적화된 함수 사용 여부 선택
    const paginatedData = useOptimized 
      ? await getSessionsOptimized(page, pageSize)
      : await getAllUserDataPaginated(page, pageSize);
    
    // 캐시에 저장
    cache.set(cacheKey, {
      data: paginatedData,
      timestamp: Date.now()
    });
    
    console.log(`관리자 API: 조회 완료 - ${paginatedData.sessions.length}개/${paginatedData.totalSessions}개 세션`);
    
    return NextResponse.json({
      success: true,
      cached: false,
      ...paginatedData
    });
    
  } catch (error) {
    console.error('관리자 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 특정 세션의 상세 데이터 조회 (보고서용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId } = body;
    
    console.log(`관리자 API: 세션 상세 조회 - ${userId}/${sessionId}`);
    
    if (!userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'userId와 sessionId가 필요합니다.'
      }, { status: 400 });
    }
    
    const sessionData = await getSessionFullData(userId, sessionId);
    
    // 비밀번호 포맷팅
    const formatPassword = (password: string): string => {
      return password || ''; // 관리자 페이지에서는 비밀번호를 그대로 표시
    };
    
    // 응답 데이터에 포맷된 비밀번호 추가
    const responseData = {
      ...sessionData,
      formattedPhone: formatPassword(userId),
      userId: userId,
      sessionId: sessionId
    };
    
    console.log('관리자 API: 세션 상세 데이터 조회 완료');
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('세션 상세 데이터 조회 오류:', error);
    return NextResponse.json({
      success: false,
      error: '세션 데이터 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 