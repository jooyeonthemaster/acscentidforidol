/**
 * 캐시 관리 시스템
 * 실시간 데이터 반영을 위한 캐시 무효화 관리
 */

import { NextResponse } from 'next/server';

// 메모리 캐시 저장소 (여러 API에서 공유)
export const globalCache = new Map();

// 캐시 키 생성 함수들
export const getCacheKey = {
  adminSessions: (page, pageSize, statusFilter) => `admin_sessions_${page}_${pageSize}_${statusFilter}`,
  sessionDetail: (userId, sessionId) => `session_detail_${userId}_${sessionId}`,
  userSessions: (userId) => `user_sessions_${userId}`,
  performanceStats: () => 'performance_stats'
};

// 캐시 TTL 설정
// ✅ 최적화: TTL 증가로 불필요한 재조회 감소
export const CACHE_TTL = {
  ADMIN_SESSIONS: 2 * 60 * 1000,      // 2분 (10초→2분, 관리자 페이지)
  SESSION_DETAIL: 5 * 60 * 1000,      // 5분 (30초→5분, 세션 상세)
  USER_SESSIONS: 10 * 60 * 1000,      // 10분 (1분→10분, 사용자 세션)
  PERFORMANCE_STATS: 5 * 60 * 1000    // 5분 (30초→5분, 성능 통계)
};

/**
 * 캐시 유효성 검사
 */
export function isValidCache(cacheEntry, ttl = CACHE_TTL.ADMIN_SESSIONS) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < ttl;
}

/**
 * 캐시에서 데이터 가져오기
 */
export function getFromCache(key, ttl = CACHE_TTL.ADMIN_SESSIONS) {
  const cached = globalCache.get(key);
  if (isValidCache(cached, ttl)) {
    console.log(`⚡ 캐시 적중: ${key}`);
    return cached.data;
  }
  return null;
}

/**
 * 캐시에 데이터 저장
 */
export function setCache(key, data, customTtl = null) {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: customTtl
  });
  console.log(`💾 캐시 저장: ${key}`);
}

/**
 * 특정 패턴의 캐시 무효화
 */
export function invalidateCachePattern(pattern) {
  const invalidatedKeys = [];
  
  for (const [key, value] of globalCache.entries()) {
    if (key.includes(pattern)) {
      globalCache.delete(key);
      invalidatedKeys.push(key);
    }
  }
  
  if (invalidatedKeys.length > 0) {
    console.log(`🗑️ 캐시 무효화: ${invalidatedKeys.join(', ')}`);
  }
  
  return invalidatedKeys;
}

/**
 * 전체 캐시 초기화
 */
export function clearAllCache() {
  const size = globalCache.size;
  globalCache.clear();
  console.log(`🧹 전체 캐시 초기화: ${size}개 항목 삭제`);
  return size;
}

/**
 * 관리자 페이지 캐시 무효화 (핵심 기능)
 */
export function invalidateAdminCache() {
  const patterns = ['admin_sessions', 'performance_stats'];
  let totalInvalidated = 0;
  
  patterns.forEach(pattern => {
    const invalidated = invalidateCachePattern(pattern);
    totalInvalidated += invalidated.length;
  });
  
  console.log(`🔄 관리자 캐시 무효화 완료: ${totalInvalidated}개 항목`);
  return totalInvalidated;
}

/**
 * 세션 관련 캐시 무효화
 */
export function invalidateSessionCache(userId, sessionId) {
  const patterns = [
    'admin_sessions',           // 관리자 페이지 캐시
    'performance_stats',        // 성능 통계 캐시
    `session_detail_${userId}`, // 특정 세션 상세 캐시
    `user_sessions_${userId}`   // 사용자별 세션 캐시
  ];
  
  let totalInvalidated = 0;
  patterns.forEach(pattern => {
    const invalidated = invalidateCachePattern(pattern);
    totalInvalidated += invalidated.length;
  });
  
  console.log(`🔄 세션 캐시 무효화 완료 (${userId}/${sessionId}): ${totalInvalidated}개 항목`);
  return totalInvalidated;
}

/**
 * 캐시 상태 조회
 */
export function getCacheStats() {
  const stats = {
    totalEntries: globalCache.size,
    entries: {},
    totalSize: 0
  };
  
  for (const [key, value] of globalCache.entries()) {
    const age = Date.now() - value.timestamp;
    const isExpired = value.ttl ? age > value.ttl : age > CACHE_TTL.ADMIN_SESSIONS;
    
    stats.entries[key] = {
      age: Math.round(age / 1000) + 's',
      isExpired,
      dataSize: JSON.stringify(value.data).length
    };
    
    stats.totalSize += JSON.stringify(value).length;
  }
  
  return stats;
}

/**
 * 만료된 캐시 자동 정리
 */
export function cleanupExpiredCache() {
  let cleanedCount = 0;
  
  for (const [key, value] of globalCache.entries()) {
    const age = Date.now() - value.timestamp;
    const ttl = value.ttl || CACHE_TTL.ADMIN_SESSIONS;
    
    if (age > ttl) {
      globalCache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧽 만료된 캐시 정리: ${cleanedCount}개 항목 삭제`);
  }
  
  return cleanedCount;
}

// 주기적 캐시 정리 (10분마다)
if (typeof window === 'undefined') { // 서버에서만 실행
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}

/**
 * API 응답에 캐시 헤더 추가
 */
export function createCachedResponse(data, cached = false, source = 'firestore') {
  return NextResponse.json({
    success: true,
    cached,
    source,
    timestamp: Date.now(),
    ...data
  });
}

export default {
  globalCache,
  getCacheKey,
  CACHE_TTL,
  isValidCache,
  getFromCache,
  setCache,
  invalidateCachePattern,
  clearAllCache,
  invalidateAdminCache,
  invalidateSessionCache,
  getCacheStats,
  cleanupExpiredCache,
  createCachedResponse
};