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

// 이미지 분석 결과 및 이미지 링크 저장 함수 (개선)
export const saveImageAnalysisWithLink = async (userId, sessionId, analysisData, imageUrl) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    
    // 먼저 세션이 존재하는지 확인
    const sessionSnapshot = await get(sessionRef);
    
    if (!sessionSnapshot.exists()) {
      // 세션이 존재하지 않으면 새로 생성
      console.log('세션이 존재하지 않아 새로 생성합니다:', sessionId);
      await set(sessionRef, {
        sessionId: sessionId,
        userId: userId,
        status: 'image_analyzed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
        updatedAt: serverTimestamp(),
      });
    }
    
    // 별도로 이미지 분석 기록도 저장
    const analysesRef = ref(db, `users/${userId}/imageAnalyses`);
    const newAnalysisRef = push(analysesRef);
    await set(newAnalysisRef, {
      sessionId: sessionId,
      imageUrl: imageUrl,
      ...analysisData,
      timestamp: serverTimestamp(),
    });
    
    console.log('이미지 분석 및 링크 저장 완료');
    return { sessionUpdated: true, analysisId: newAnalysisRef.key };
  } catch (error) {
    console.error('이미지 분석 저장 오류:', error);
    throw error;
  }
};

// 세션별 피드백 저장 함수
export const saveSessionFeedback = async (userId, sessionId, feedbackData) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      feedback: feedbackData,
      status: 'feedback_given',
      updatedAt: serverTimestamp(),
    });
    
    // 별도로 피드백 기록도 저장
    const feedbacksRef = ref(db, `users/${userId}/feedbacks`);
    const newFeedbackRef = push(feedbacksRef);
    await set(newFeedbackRef, {
      sessionId: sessionId,
      ...feedbackData,
      timestamp: serverTimestamp(),
    });
    
    console.log('세션 피드백 저장 완료');
    return { sessionUpdated: true, feedbackId: newFeedbackRef.key };
  } catch (error) {
    console.error('세션 피드백 저장 오류:', error);
    throw error;
  }
};

// 개선된 레시피 저장 함수
export const saveImprovedRecipe = async (userId, sessionId, recipeData) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      improvedRecipe: recipeData,
      status: 'recipe_created',
      updatedAt: serverTimestamp(),
    });
    
    // 별도로 레시피 기록도 저장
    const recipesRef = ref(db, `users/${userId}/recipes`);
    const newRecipeRef = push(recipesRef);
    await set(newRecipeRef, {
      sessionId: sessionId,
      ...recipeData,
      timestamp: serverTimestamp(),
    });
    
    console.log('개선된 레시피 저장 완료');
    return { sessionUpdated: true, recipeId: newRecipeRef.key };
  } catch (error) {
    console.error('개선된 레시피 저장 오류:', error);
    throw error;
  }
};

// 향 확정 함수
export const confirmPerfume = async (userId, sessionId, confirmationData) => {
  try {
    const sessionRef = ref(db, `users/${userId}/perfumeSessions/${sessionId}`);
    await update(sessionRef, {
      confirmation: {
        ...confirmationData,
        confirmedAt: serverTimestamp(),
      },
      status: 'confirmed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // 별도로 확정된 향수 기록도 저장
    const confirmedPerfumesRef = ref(db, `users/${userId}/confirmedPerfumes`);
    const newConfirmationRef = push(confirmedPerfumesRef);
    await set(newConfirmationRef, {
      sessionId: sessionId,
      ...confirmationData,
      timestamp: serverTimestamp(),
    });
    
    console.log('향수 확정 완료');
    return { sessionCompleted: true, confirmationId: newConfirmationRef.key };
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