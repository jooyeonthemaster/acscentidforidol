import { db } from './firebase';
import { ref, set, push, serverTimestamp } from 'firebase/database';

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

// 여기에 향수 추천, 피드백, 테스팅 향 추천 저장 함수들을 추가할 수 있습니다. 