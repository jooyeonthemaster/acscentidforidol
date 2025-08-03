import { db } from './firebase';
import { ref, set, push, get, update, serverTimestamp } from 'firebase/database';

// 이미지 분석 결과 저장 함수 (예시)
export const saveImageAnalysis = async (userId, analysisData) => {
  try {
    const analysesRef = ref(db, `users/${userId}/imageAnalyses`);
    const newAnalysisRef = push(analysesRef); // 새로운 고유 키 생성
    await set(newAnalysisRef, {
      ...analysisData,
      timestamp: serverTimestamp(), // 서버 시간 기준으로 타임스탬프 기록
    });
    console.log('Image analysis saved successfully with id: ', newAnalysisRef.key);
    return newAnalysisRef.key; // 저장된 데이터의 키 반환
  } catch (error) {
    console.error('Error saving image analysis: ', error);
    throw error;
  }
};

// 이미지 분석 기반 향수 추천 저장 함수
export const savePerfumeRecommendation = async (userId, analysisId, recommendationData) => {
  try {
    const recommendationsRef = ref(db, `users/${userId}/perfumeRecommendations`);
    const newRecommendationRef = push(recommendationsRef);
    await set(newRecommendationRef, {
      basedOnAnalysisId: analysisId, // 어떤 분석 결과를 기반으로 추천했는지 ID 저장
      ...recommendationData, // 예: { recommendedPerfumes: ['향수A', '향수B'], reason: '...', otherDetails: {} }
      timestamp: serverTimestamp(),
    });
    console.log('Perfume recommendation saved successfully with id: ', newRecommendationRef.key);
    return newRecommendationRef.key;
  } catch (error) {
    console.error('Error saving perfume recommendation: ', error);
    throw error;
  }
};

// 피드백 저장 함수
export const saveFeedback = async (userId, recommendationId, feedbackData) => {
  try {
    const feedbacksRef = ref(db, `users/${userId}/feedbacks`);
    const newFeedbackRef = push(feedbacksRef);
    await set(newFeedbackRef, {
      basedOnRecommendationId: recommendationId, // 어떤 향수 추천에 대한 피드백인지 ID 저장
      ...feedbackData, // 예: { rating: 5, comment: '...', likedPerfumes: [], dislikedPerfumes: [] }
      timestamp: serverTimestamp(),
    });
    console.log('Feedback saved successfully with id: ', newFeedbackRef.key);
    return newFeedbackRef.key;
  } catch (error) {
    console.error('Error saving feedback: ', error);
    throw error;
  }
};

// 피드백 기반 테스팅 향 추천 저장 함수
export const saveTestingRecommendation = async (userId, feedbackId, testingRecommendationData) => {
  try {
    const testingRecsRef = ref(db, `users/${userId}/testingRecommendations`);
    const newTestingRecRef = push(testingRecsRef);
    await set(newTestingRecRef, {
      basedOnFeedbackId: feedbackId, // 어떤 피드백을 기반으로 추천했는지 ID 저장
      ...testingRecommendationData, // 예: { recommendedPerfumes: ['향수C', '향수D'], reason: '...' }
      timestamp: serverTimestamp(),
    });
    console.log('Testing recommendation saved successfully with id: ', newTestingRecRef.key);
    return newTestingRecRef.key;
  } catch (error) {
    console.error('Error saving testing recommendation: ', error);
    throw error;
  }
};

// 세션 생성 함수 (전체 플로우의 시작)
export const createPerfumeSession = async (userId, sessionData) => {
  try {
    const sessionsRef = ref(db, `users/${userId}/perfumeSessions`);
    const newSessionRef = push(sessionsRef);
    await set(newSessionRef, {
      ...sessionData,
      sessionId: newSessionRef.key,
      status: 'started', // started, image_analyzed, feedback_given, recipe_created, confirmed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('향수 세션 생성 완료:', newSessionRef.key);
    return newSessionRef.key;
  } catch (error) {
    console.error('향수 세션 생성 오류:', error);
    throw error;
  }
};

// 이미지 분석 결과 및 이미지 링크 저장 함수 (성능 최적화)
export const saveImageAnalysisWithLink = async (userId, sessionId, analysisData, imageUrl) => {
  try {
    console.log('🚀 최적화된 이미지 분석 저장 시작:', sessionId);
    const now = Date.now(); // serverTimestamp() 대신 클라이언트 시간 사용
    
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    
    // 먼저 세션이 존재하는지 확인
    const sessionSnapshot = await get(sessionRef);
    
    if (!sessionSnapshot.exists()) {
      // 세션이 존재하지 않으면 새로 생성 (중복 저장 제거)
      console.log('세션이 존재하지 않아 새로 생성합니다:', sessionId);
      await set(sessionRef, {
        sessionId: sessionId,
        userId: userId,
        status: 'image_analyzed',
        createdAt: now,
        updatedAt: now,
        imageUrl: imageUrl,
        imageAnalysis: analysisData,
      });
    } else {
      // 세션이 존재하면 업데이트
      console.log('기존 세션을 업데이트합니다:', sessionId);
      await update(sessionRef, {
        imageUrl: imageUrl,
        imageAnalysis: analysisData,
        status: 'image_analyzed',
        updatedAt: now,
      });
    }
    
    // 중복 저장 제거 - 세션에만 저장하고 별도 imageAnalyses 저장 생략
    // 필요시 세션 데이터에서 분석 결과를 조회할 수 있음
    
    console.log('🚀 최적화된 이미지 분석 저장 완료 (1회 write)');
    return { sessionUpdated: true, analysisId: sessionId };
  } catch (error) {
    console.error('이미지 분석 저장 오류:', error);
    throw error;
  }
};

// 세션별 피드백 저장 함수 (성능 최적화)
export const saveSessionFeedback = async (userId, sessionId, feedbackData) => {
  try {
    console.log('🚀 최적화된 피드백 저장 시작:', sessionId);
    const now = Date.now(); // serverTimestamp() 대신 클라이언트 시간 사용
    
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      feedback: feedbackData,
      status: 'feedback_given',
      updatedAt: now,
    });
    
    // 중복 저장 제거 - 세션에만 저장하고 별도 feedbacks 저장 생략
    // 필요시 세션 데이터에서 피드백을 조회할 수 있음
    
    console.log('🚀 최적화된 피드백 저장 완료 (1회 write)');
    return { sessionUpdated: true, feedbackId: sessionId };
  } catch (error) {
    console.error('세션 피드백 저장 오류:', error);
    throw error;
  }
};

// 개선된 레시피 저장 함수 (성능 최적화)
export const saveImprovedRecipe = async (userId, sessionId, recipeData) => {
  try {
    console.log('🚀 최적화된 레시피 저장 시작:', { userId, sessionId, recipeDataKeys: Object.keys(recipeData) });
    const now = Date.now(); // serverTimestamp() 대신 클라이언트 시간 사용
    
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      improvedRecipe: recipeData,
      status: 'recipe_created',
      updatedAt: now,
    });
    
    // 중복 저장 제거 - 세션에만 저장하고 별도 recipes 저장 생략
    // 필요시 세션 데이터에서 레시피를 조회할 수 있음
    
    console.log('🚀 최적화된 레시피 저장 완료 (1회 write)');
    return { sessionUpdated: true, recipeId: sessionId };
  } catch (error) {
    console.error('🚀 레시피 저장 오류:', error);
    throw error;
  }
};

// 향 확정 함수 (성능 최적화)
export const confirmPerfume = async (userId, sessionId, confirmationData) => {
  try {
    console.log('🚀 최적화된 향수 확정 시작:', sessionId);
    const now = Date.now(); // serverTimestamp() 대신 클라이언트 시간 사용
    
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      confirmation: {
        ...confirmationData,
        confirmedAt: now,
      },
      status: 'confirmed',
      completedAt: now,
      updatedAt: now,
    });
    
    // 중복 저장 제거 - 세션에만 저장하고 별도 confirmedPerfumes 저장 생략
    // 필요시 세션 데이터에서 확정 정보를 조회할 수 있음
    
    console.log('🚀 최적화된 향수 확정 완료 (1회 write)');
    return { sessionCompleted: true, confirmationId: sessionId };
  } catch (error) {
    console.error('향수 확정 오류:', error);
    throw error;
  }
};

// 세션 조회 함수
export const getPerfumeSession = async (userId, sessionId) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    const snapshot = await get(sessionRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('세션을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('세션 조회 오류:', error);
    throw error;
  }
};

// 사용자의 모든 세션 조회 함수
export const getUserSessions = async (userId) => {
  try {
    const sessionsRef = ref(db, `users/${userId}/perfumeSessions`);
    const snapshot = await get(sessionsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('사용자 세션 조회 오류:', error);
    throw error;
  }
};

// 관리자용: 모든 사용자 데이터 조회 함수
export const getAllUserData = async () => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('모든 사용자 데이터 조회 오류:', error);
    throw error;
  }
};

// 관리자용: 페이지네이션을 지원하는 사용자 데이터 조회 함수
export const getAllUserDataPaginated = async (page = 1, pageSize = 10) => {
  try {
    console.log(`페이지네이션 데이터 조회 시작 - 페이지: ${page}, 사이즈: ${pageSize}`);
    
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return {
        sessions: [],
        totalSessions: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: pageSize
      };
    }
    
    const allData = snapshot.val();
    const sessionsList = [];
    
    // 안전한 문자열 변환 함수
    const safeStringify = (value) => {
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
          
          // 비밀번호 포맷팅 (4자리 숫자)
          const formatPassword = (password) => {
            return password || '';
          };
          
          // 안전한 최애 이름 추출
          let idolName = '분석 중';
          if (session.imageAnalysis?.matchingPerfumes?.[0]?.name) {
            idolName = session.imageAnalysis.matchingPerfumes[0].name;
          } else if (session.imageAnalysis?.analysis) {
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
    
    const totalSessions = sessionsList.length;
    const totalPages = Math.ceil(totalSessions / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSessions = sessionsList.slice(startIndex, endIndex);
    
    console.log(`페이지네이션 처리 완료 - 전체: ${totalSessions}개, 현재 페이지: ${page}/${totalPages}, 반환: ${paginatedSessions.length}개`);
    
    return {
      sessions: paginatedSessions,
      totalSessions: totalSessions,
      totalPages: totalPages,
      currentPage: page,
      pageSize: pageSize
    };
    
  } catch (error) {
    console.error('페이지네이션 데이터 조회 오류:', error);
    throw error;
  }
};

// 관리자용: 특정 세션의 전체 데이터 조회 함수
export const getSessionFullData = async (userId, sessionId) => {
  try {
    // 세션 기본 정보
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    const sessionSnapshot = await get(sessionRef);
    
    // 관련 이미지 분석 데이터
    const analysesRef = ref(db, `users/${userId}/imageAnalyses`);
    const analysesSnapshot = await get(analysesRef);
    
    // 관련 피드백 데이터
    const feedbacksRef = ref(db, `users/${userId}/feedbacks`);
    const feedbacksSnapshot = await get(feedbacksRef);
    
    // 관련 레시피 데이터
    const recipesRef = ref(db, `users/${userId}/recipes`);
    const recipesSnapshot = await get(recipesRef);
    
    // 관련 확정 데이터
    const confirmedRef = ref(db, `users/${userId}/confirmedPerfumes`);
    const confirmedSnapshot = await get(confirmedRef);
    
    const result = {
      session: sessionSnapshot.exists() ? sessionSnapshot.val() : null,
      analyses: [],
      feedbacks: [],
      recipes: [],
      confirmed: []
    };
    
    // sessionId와 일치하는 데이터만 필터링
    if (analysesSnapshot.exists()) {
      const analyses = analysesSnapshot.val();
      result.analyses = Object.keys(analyses)
        .filter(key => analyses[key].sessionId === sessionId)
        .map(key => ({ id: key, ...analyses[key] }));
    }
    
    if (feedbacksSnapshot.exists()) {
      const feedbacks = feedbacksSnapshot.val();
      result.feedbacks = Object.keys(feedbacks)
        .filter(key => feedbacks[key].sessionId === sessionId)
        .map(key => ({ id: key, ...feedbacks[key] }));
    }
    
    if (recipesSnapshot.exists()) {
      const recipes = recipesSnapshot.val();
      result.recipes = Object.keys(recipes)
        .filter(key => recipes[key].sessionId === sessionId)
        .map(key => ({ id: key, ...recipes[key] }));
    }
    
    if (confirmedSnapshot.exists()) {
      const confirmed = confirmedSnapshot.val();
      result.confirmed = Object.keys(confirmed)
        .filter(key => confirmed[key].sessionId === sessionId)
        .map(key => ({ id: key, ...confirmed[key] }));
    }
    
    return result;
  } catch (error) {
    console.error('세션 전체 데이터 조회 오류:', error);
    throw error;
  }
};

// 세션별 레시피 히스토리 조회 함수
export const getSessionRecipes = async (userId, sessionId) => {
  try {
    console.log('🔍 getSessionRecipes 호출됨:', { userId, sessionId });
    
    const recipesRef = ref(db, `users/${userId}/recipes`);
    const snapshot = await get(recipesRef);
    
    if (snapshot.exists()) {
      const allRecipes = snapshot.val();
      console.log('🔍 전체 레시피 데이터:', {
        totalRecipes: Object.keys(allRecipes).length,
        recipeIds: Object.keys(allRecipes),
        sessionIds: Object.keys(allRecipes).map(key => ({ id: key, sessionId: allRecipes[key].sessionId }))
      });
      
      const sessionRecipes = Object.keys(allRecipes)
        .filter(key => {
          const recipeSessionId = allRecipes[key].sessionId;
          const match = recipeSessionId === sessionId;
          console.log('🔍 세션 매칭 체크:', { recipeId: key, recipeSessionId, targetSessionId: sessionId, match });
          return match;
        })
        .map(key => ({ 
          id: key, 
          ...allRecipes[key],
          createdAt: allRecipes[key].timestamp || allRecipes[key].generatedAt
        }))
        .sort((a, b) => {
          // 타임스탬프로 최신순 정렬
          const timeA = a.createdAt || 0;
          const timeB = b.createdAt || 0;
          return timeB - timeA;
        });
      
      console.log(`🔍 세션 ${sessionId}의 레시피 ${sessionRecipes.length}개 조회 완료`);
      return sessionRecipes;
    } else {
      console.log('🔍 레시피 데이터가 없습니다.');
      return [];
    }
  } catch (error) {
    console.error('🔍 세션 레시피 조회 오류:', error);
    throw error;
  }
};

// 특정 레시피 상세 조회 함수
export const getRecipeById = async (userId, recipeId) => {
  try {
    const recipeRef = ref(db, `users/${userId}/recipes/${recipeId}`);
    const snapshot = await get(recipeRef);
    
    if (snapshot.exists()) {
      return { id: recipeId, ...snapshot.val() };
    } else {
      throw new Error('레시피를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('레시피 상세 조회 오류:', error);
    throw error;
  }
};

// 선택한 레시피를 세션의 현재 레시피로 설정하는 함수
export const setSessionActiveRecipe = async (userId, sessionId, recipeData) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      improvedRecipe: {
        ...recipeData,
        selectedFromHistory: true,
        reactivatedAt: serverTimestamp()
      },
      status: 'recipe_selected',
      updatedAt: serverTimestamp(),
    });
    
    console.log('세션의 활성 레시피 설정 완료');
    return { success: true, message: '이전 레시피가 활성화되었습니다.' };
  } catch (error) {
    console.error('활성 레시피 설정 오류:', error);
    throw error;
  }
};

// 레시피 즐겨찾기/북마크 기능
export const toggleRecipeBookmark = async (userId, recipeId, isBookmarked) => {
  try {
    const recipeRef = ref(db, `users/${userId}/recipes/${recipeId}`);
    await update(recipeRef, {
      isBookmarked: isBookmarked,
      bookmarkedAt: isBookmarked ? serverTimestamp() : null,
    });
    
    console.log(`레시피 북마크 ${isBookmarked ? '추가' : '제거'} 완료`);
    return { success: true, isBookmarked };
  } catch (error) {
    console.error('레시피 북마크 오류:', error);
    throw error;
  }
}; 

// 관리자용: 최적화된 세션 목록 조회 (필수 필드만)
export const getSessionsOptimized = async (page = 1, pageSize = 10) => {
  try {
    console.log(`최적화된 데이터 조회 시작 - 페이지: ${page}, 사이즈: ${pageSize}`);
    
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return {
        sessions: [],
        totalSessions: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: pageSize
      };
    }
    
    const allData = snapshot.val();
    const sessionsList = [];
    
    // 최소한의 필드만 추출하여 성능 향상
    Object.keys(allData).forEach(userId => {
      const userData = allData[userId];
      if (userData.perfumeSessions) {
        Object.keys(userData.perfumeSessions).forEach(sessionId => {
          const session = userData.perfumeSessions[sessionId];
          
          // 필수 필드만 추출 (메모리 사용량 크게 감소)
          sessionsList.push({
            userId,
            sessionId,
            phoneNumber: userId,
            createdAt: session.createdAt || session.updatedAt || Date.now(),
            updatedAt: session.updatedAt || session.createdAt || Date.now(),
            customerName: session.customerName || '알 수 없음',
            idolName: session.imageAnalysis?.matchingPerfumes?.[0]?.name || 
                     (session.imageAnalysis?.analysis ? '분석 완료' : '분석 중'),
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
    
    // 최신순 정렬
    sessionsList.sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return timeB - timeA;
    });
    
    const totalSessions = sessionsList.length;
    const totalPages = Math.ceil(totalSessions / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSessions = sessionsList.slice(startIndex, endIndex);
    
    console.log(`최적화된 조회 완료 - 전체: ${totalSessions}개, 반환: ${paginatedSessions.length}개`);
    
    return {
      sessions: paginatedSessions,
      totalSessions,
      totalPages,
      currentPage: page,
      pageSize
    };
    
  } catch (error) {
    console.error('최적화된 데이터 조회 오류:', error);
    throw error;
  }
}; 