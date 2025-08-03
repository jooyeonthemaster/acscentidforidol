import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { ref, get, remove, update } from 'firebase/database';

/**
 * 파이어베이스 데이터 정리 API
 * 최신 30개 세션만 남기고 과거 데이터 삭제
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, keepCount = 30 } = body;
    
    if (action !== 'cleanup') {
      return NextResponse.json({
        success: false,
        error: 'action 필드에 "cleanup"을 지정해주세요.'
      }, { status: 400 });
    }

    console.log(`🧹 데이터 정리 시작 - 최신 ${keepCount}개 세션만 유지`);
    
    // 1. 전체 사용자 데이터 조회
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      return NextResponse.json({
        success: true,
        message: '정리할 데이터가 없습니다.',
        stats: { totalUsers: 0, totalSessions: 0, deletedSessions: 0 }
      });
    }
    
    const allData = usersSnapshot.val();
    const sessionsList: Array<{userId: string, sessionId: string, timestamp: number}> = [];
    
    // 2. 모든 세션 수집 및 타임스탬프로 정렬
    Object.keys(allData).forEach(userId => {
      const userData = allData[userId];
      if (userData.perfumeSessions) {
        Object.keys(userData.perfumeSessions).forEach(sessionId => {
          const session = userData.perfumeSessions[sessionId];
          const timestamp = session.updatedAt || session.createdAt || 0;
          sessionsList.push({ userId, sessionId, timestamp });
        });
      }
    });
    
    // 최신순으로 정렬
    sessionsList.sort((a, b) => b.timestamp - a.timestamp);
    
    const totalSessions = sessionsList.length;
    console.log(`📊 전체 세션 수: ${totalSessions}개`);
    
    if (totalSessions <= keepCount) {
      return NextResponse.json({
        success: true,
        message: `현재 세션 수(${totalSessions}개)가 유지 개수(${keepCount}개) 이하입니다.`,
        stats: { totalUsers: Object.keys(allData).length, totalSessions, deletedSessions: 0 }
      });
    }
    
    // 3. 삭제할 세션 목록 (keepCount 이후의 세션들)
    const sessionsToDelete = sessionsList.slice(keepCount);
    console.log(`🗑️ 삭제할 세션 수: ${sessionsToDelete.length}개`);
    
    let deletedCount = 0;
    const deletionResults = [];
    
    // 4. 세션별로 삭제 (관련 데이터도 함께)
    for (const { userId, sessionId } of sessionsToDelete) {
      try {
        // 메인 세션 삭제
        const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
        await remove(sessionRef);
        
        // 관련 이미지 분석 데이터 삭제
        const analysesRef = ref(db, `users/${userId}/imageAnalyses`);
        const analysesSnapshot = await get(analysesRef);
        if (analysesSnapshot.exists()) {
          const analyses = analysesSnapshot.val();
          for (const [analysisId, analysis] of Object.entries(analyses)) {
            if ((analysis as any).sessionId === sessionId) {
              await remove(ref(db, `users/${userId}/imageAnalyses/${analysisId}`));
            }
          }
        }
        
        // 관련 피드백 데이터 삭제
        const feedbacksRef = ref(db, `users/${userId}/feedbacks`);
        const feedbacksSnapshot = await get(feedbacksRef);
        if (feedbacksSnapshot.exists()) {
          const feedbacks = feedbacksSnapshot.val();
          for (const [feedbackId, feedback] of Object.entries(feedbacks)) {
            if ((feedback as any).sessionId === sessionId) {
              await remove(ref(db, `users/${userId}/feedbacks/${feedbackId}`));
            }
          }
        }
        
        // 관련 레시피 데이터 삭제
        const recipesRef = ref(db, `users/${userId}/recipes`);
        const recipesSnapshot = await get(recipesRef);
        if (recipesSnapshot.exists()) {
          const recipes = recipesSnapshot.val();
          for (const [recipeId, recipe] of Object.entries(recipes)) {
            if ((recipe as any).sessionId === sessionId) {
              await remove(ref(db, `users/${userId}/recipes/${recipeId}`));
            }
          }
        }
        
        // 관련 확정 향수 데이터 삭제
        const confirmedRef = ref(db, `users/${userId}/confirmedPerfumes`);
        const confirmedSnapshot = await get(confirmedRef);
        if (confirmedSnapshot.exists()) {
          const confirmed = confirmedSnapshot.val();
          for (const [confirmedId, confirmedData] of Object.entries(confirmed)) {
            if ((confirmedData as any).sessionId === sessionId) {
              await remove(ref(db, `users/${userId}/confirmedPerfumes/${confirmedId}`));
            }
          }
        }
        
        deletedCount++;
        deletionResults.push({ userId, sessionId, status: 'success' });
        
        // 진행률 출력 (10개마다)
        if (deletedCount % 10 === 0) {
          console.log(`🔄 진행률: ${deletedCount}/${sessionsToDelete.length} (${((deletedCount / sessionsToDelete.length) * 100).toFixed(1)}%)`);
        }
        
      } catch (error) {
        console.error(`❌ 세션 삭제 실패: ${userId}/${sessionId}`, error);
        deletionResults.push({ userId, sessionId, status: 'failed', error: String(error) });
      }
    }
    
    // 5. 빈 사용자 노드 정리
    let cleanedUsers = 0;
    for (const userId of Object.keys(allData)) {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        // perfumeSessions가 없거나 비어있으면 사용자 전체 삭제
        if (!userData.perfumeSessions || Object.keys(userData.perfumeSessions).length === 0) {
          await remove(userRef);
          cleanedUsers++;
        }
      }
    }
    
    console.log(`✅ 데이터 정리 완료!`);
    console.log(`📊 통계:
    - 총 세션: ${totalSessions}개
    - 유지된 세션: ${totalSessions - deletedCount}개  
    - 삭제된 세션: ${deletedCount}개
    - 정리된 빈 사용자: ${cleanedUsers}개`);
    
    return NextResponse.json({
      success: true,
      message: `데이터 정리가 완료되었습니다. ${deletedCount}개 세션이 삭제되었습니다.`,
      stats: {
        totalUsers: Object.keys(allData).length,
        totalSessions,
        keptSessions: totalSessions - deletedCount,
        deletedSessions: deletedCount,
        cleanedUsers
      },
      deletionResults: deletionResults.slice(0, 10) // 처음 10개만 반환
    });
    
  } catch (error) {
    console.error('❌ 데이터 정리 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터 정리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 데이터 정리 상태 확인 API
export async function GET(request: NextRequest) {
  try {
    console.log('📊 데이터 상태 확인 중...');
    
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      return NextResponse.json({
        success: true,
        stats: { totalUsers: 0, totalSessions: 0 }
      });
    }
    
    const allData = usersSnapshot.val();
    let totalSessions = 0;
    const userStats: Array<{userId: string, sessionCount: number}> = [];
    
    Object.keys(allData).forEach(userId => {
      const userData = allData[userId];
      const sessionCount = userData.perfumeSessions ? Object.keys(userData.perfumeSessions).length : 0;
      totalSessions += sessionCount;
      userStats.push({ userId, sessionCount });
    });
    
    // 세션 수가 많은 사용자 순으로 정렬
    userStats.sort((a, b) => b.sessionCount - a.sessionCount);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: Object.keys(allData).length,
        totalSessions,
        averageSessionsPerUser: totalSessions / Object.keys(allData).length,
        topUsers: userStats.slice(0, 10) // 상위 10명만
      }
    });
    
  } catch (error) {
    console.error('❌ 데이터 상태 확인 오류:', error);
    return NextResponse.json({
      success: false,
      error: '데이터 상태 확인 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 