import { NextRequest, NextResponse } from 'next/server';
import { getAllUserData, getSessionFullData } from '../../../lib/firebaseApi';

/**
 * 관리자용 API 엔드포인트
 * 
 * GET: 모든 사용자 데이터 조회 (분석 내역 목록)
 * POST: 특정 세션의 상세 데이터 조회 (보고서용)
 */

// 모든 사용자 분석 세션 목록 조회 (관리자용)
export async function GET() {
  try {
    console.log('관리자 API: 모든 사용자 데이터 조회 시작');
    
    const allData = await getAllUserData();
    const sessionsList: any[] = [];
    
    // 안전한 문자열 변환 함수
    const safeStringify = (value: any): string => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return String(value || '');
    };
    
    // 모든 사용자의 세션 데이터를 수집
    Object.keys(allData).forEach(userId => {
      const userData = allData[userId];
      if (userData.perfumeSessions) {
        Object.keys(userData.perfumeSessions).forEach(sessionId => {
          const session = userData.perfumeSessions[sessionId];
          
          // 타임스탬프 디버깅
          console.log(`세션 ${sessionId} 타임스탬프 디버깅:`, {
            createdAt: session.createdAt,
            createdAtType: typeof session.createdAt,
            updatedAt: session.updatedAt,
            updatedAtType: typeof session.updatedAt
          });
          
          // 비밀번호 포맷팅 (4자리 숫자)
          const formatPassword = (password: string): string => {
            return password || ''; // 관리자 페이지에서는 비밀번호를 그대로 표시
          };
          
          // 안전한 최애 이름 추출
          let idolName = '분석 중';
          if (session.imageAnalysis?.matchingPerfumes?.[0]?.name) {
            idolName = session.imageAnalysis.matchingPerfumes[0].name;
          } else if (session.imageAnalysis?.analysis) {
            // 복잡한 분석 데이터는 간단히 표시
            idolName = '분석 완료';
          }
          
          // createdAt이 없으면 updatedAt 사용, 둘 다 없으면 현재 시간 사용
          const effectiveCreatedAt = session.createdAt || session.updatedAt || Date.now();
          
          sessionsList.push({
            userId: userId,
            sessionId: sessionId,
            phoneNumber: formatPassword(userId),
            createdAt: effectiveCreatedAt,
            updatedAt: session.updatedAt || effectiveCreatedAt,
            status: session.status || 'unknown',
            customerName: session.customerName || '알 수 없음',
            idolName: idolName,
            hasImageAnalysis: !!session.imageAnalysis,
            hasFeedback: !!session.feedback,
            hasRecipe: !!session.improvedRecipe,
            hasConfirmation: !!session.confirmation,
            
            // 분석 단계별 상태 표시
            completionStatus: (() => {
              if (session.confirmation) return '완료';
              if (session.improvedRecipe) return '레시피 생성';
              if (session.feedback) return '피드백 완료';
              if (session.imageAnalysis) return '분석 완료';
              return '진행 중';
            })()
          });
        });
      }
    });
    
    // 최신순으로 정렬
    sessionsList.sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return timeB - timeA;
    });
    
    console.log(`관리자 API: 총 ${sessionsList.length}개 세션 조회 완료`);
    
    return NextResponse.json({
      success: true,
      totalSessions: sessionsList.length,
      sessions: sessionsList
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