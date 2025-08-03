import { 
  UserModel, 
  SessionModel, 
  AnalysisModel, 
  PerfumeModel, 
  FeedbackModel, 
  RecipeModel, 
  ConfirmationModel,
  BatchOperations 
} from './firestoreModels';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firestore';

/**
 * Firestore API 함수들
 * 기존 Realtime Database API와 호환되는 인터페이스 제공
 * 하지만 내부적으로는 Firestore의 효율적인 쿼리 사용
 */

// 세션 관련 API
export const createPerfumeSession = async (userId, sessionData) => {
  try {
    console.log('🔥 Firestore 세션 생성:', { userId, sessionData });
    
    // 사용자 존재 확인 또는 생성
    let user = await UserModel.findByPhone(userId);
    if (!user) {
      user = await UserModel.create(userId, sessionData.customerName || '알 수 없음');
    }
    
    const session = await SessionModel.create(
      user.id, 
      userId, 
      sessionData.customerName || user.customerName
    );
    
    console.log('✅ Firestore 세션 생성 완료:', session.id);
    return session.id;
  } catch (error) {
    console.error('❌ Firestore 세션 생성 오류:', error);
    throw error;
  }
};

export const getPerfumeSession = async (userId, sessionId) => {
  try {
    const sessionDoc = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
    
    if (!sessionDoc.exists()) {
      throw new Error('세션을 찾을 수 없습니다.');
    }
    
    const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
    
    // 관련 데이터도 함께 로드 (필요시)
    const analysis = await AnalysisModel.getBySession(sessionId);
    const recipes = await RecipeModel.getBySession(sessionId);
    
    return {
      ...sessionData,
      imageAnalysis: analysis,
      recipes: recipes
    };
  } catch (error) {
    console.error('❌ 세션 조회 오류:', error);
    throw error;
  }
};

export const getUserSessions = async (userId) => {
  try {
    // 사용자 찾기
    const user = await UserModel.findByPhone(userId);
    if (!user) {
      return {};
    }
    
    const result = await SessionModel.getByUser(user.id, 50); // 최대 50개
    
    // Realtime DB 형식으로 변환
    const sessions = {};
    result.sessions.forEach(session => {
      sessions[session.id] = session;
    });
    
    return sessions;
  } catch (error) {
    console.error('❌ 사용자 세션 조회 오류:', error);
    throw error;
  }
};

// 이미지 분석 관련 API
export const saveImageAnalysisWithLink = async (userId, sessionId, analysisData, imageUrl) => {
  try {
    console.log('🔥 Firestore 이미지 분석 저장:', { userId, sessionId });
    
    // 사용자 찾기 또는 자동 생성
    let user = await UserModel.findByPhone(userId);
    if (!user) {
      console.log('🆕 사용자가 존재하지 않아 자동 생성:', userId);
      try {
        user = await UserModel.create(userId, `User_${userId}`);
        console.log('✅ 사용자 자동 생성 완료:', user.id);
      } catch (createError) {
        console.error('❌ 사용자 생성 실패:', createError);
        throw new Error(`사용자 생성에 실패했습니다: ${createError.message}`);
      }
    }
    
    // 세션 문서 직접 생성 (특정 ID 사용)
    console.log('🆕 새 세션 생성:', sessionId);
    try {
      const sessionData = {
        userId: user.id,
        phoneNumber: userId,
        customerName: user.customerName || `User_${userId}`,
        idolName: analysisData.name || 'Unknown',
        status: 'analyzing',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      // 특정 ID로 세션 문서 생성
      const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
      await setDoc(sessionRef, sessionData);
      
      console.log('✅ 세션 생성 완료:', sessionId);
    } catch (createError) {
      console.error('❌ 세션 생성 실패:', createError);
      throw new Error(`세션 생성에 실패했습니다: ${createError.message}`);
    }
    
    // 향수 매칭 데이터 처리 (정규화)
    const perfumeIds = [];
    let primaryPerfumeId = null;
    
    if (analysisData.matchingPerfumes && analysisData.matchingPerfumes.length > 0) {
      // 향수 마스터 데이터 저장 및 ID 추출
      for (const perfume of analysisData.matchingPerfumes) {
        // 향수가 이미 존재하는지 확인 후 없으면 생성
        const perfumeId = await ensurePerfumeExists(perfume);
        
        // null이 아닌 경우만 추가
        if (perfumeId) {
          perfumeIds.push(perfumeId);
          
          if (!primaryPerfumeId) {
            primaryPerfumeId = perfumeId;
          }
        } else {
          console.warn('⚠️ 향수 ID가 null입니다:', perfume);
        }
      }
    }
    
    // 분석 데이터에서 큰 객체 제거하고 참조만 저장
    const cleanAnalysisData = {
      ...analysisData,
      imageUrl,
      matchingPerfumeIds: perfumeIds,
      primaryPerfumeId: primaryPerfumeId,
      idolInfo: {
        name: analysisData.name,
        gender: analysisData.gender,
        style: analysisData.style || [],
        personality: analysisData.personality || [],
        charms: analysisData.charms || ''
      }
    };
    
    // matchingPerfumes 제거 (정규화)
    delete cleanAnalysisData.matchingPerfumes;
    delete cleanAnalysisData.name;
    delete cleanAnalysisData.gender;
    delete cleanAnalysisData.style;
    delete cleanAnalysisData.personality;
    delete cleanAnalysisData.charms;
    
    // 분석 결과 저장
    const analysis = await AnalysisModel.create(sessionId, user.id, cleanAnalysisData);
    
    // 세션에 분석 ID 연결
    try {
      await SessionModel.updateStatus(sessionId, 'analysis_completed', {
        analysisId: analysis.id,
        idolName: analysisData.name || 'Unknown'
      });
      console.log('✅ 세션 업데이트 완료:', sessionId);
    } catch (updateError) {
      console.error('⚠️ 세션 업데이트 실패 (계속 진행):', updateError);
    }
    
    console.log('✅ Firestore 이미지 분석 저장 완료');
    return { sessionUpdated: true, analysisId: analysis.id };
  } catch (error) {
    console.error('❌ Firestore 이미지 분석 저장 오류:', error);
    throw error;
  }
};

// 향수 존재 확인 및 생성 헬퍼 함수
const ensurePerfumeExists = async (perfumeData) => {
  // 향수 이름 추출 (persona.name 또는 name)
  const perfumeName = perfumeData?.persona?.name || perfumeData?.name;
  
  // 유효성 검사
  if (!perfumeData || !perfumeName) {
    console.warn('⚠️ ensurePerfumeExists: 향수 이름이 없습니다', perfumeData);
    return null;
  }
  
  try {
    // 향수 이름으로 검색
    const q = query(
      collection(db, COLLECTIONS.PERFUMES),
      where('name', '==', perfumeName),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // 이미 존재하는 향수
      return snapshot.docs[0].id;
    }
    
    // 새 향수 생성 - Plain 객체 사용
    const perfume = {
      name: perfumeName,
      brand: perfumeData.brand || perfumeData.persona?.brand || '',
      description: perfumeData.description || perfumeData.persona?.description || '',
      notes: perfumeData.notes || {},
      characteristics: perfumeData.characteristics || perfumeData.persona?.traits || {},
      persona: perfumeData.persona || {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PERFUMES), perfume);
    return docRef.id;
  } catch (error) {
    console.error('❌ ensurePerfumeExists 오류:', error);
    return null;
  }
};

// 피드백 관련 API
export const saveSessionFeedback = async (userId, sessionId, feedbackData) => {
  try {
    console.log('🔥 Firestore 피드백 저장:', { userId, sessionId });
    
    // 사용자 찾기 또는 자동 생성
    let user = await UserModel.findByPhone(userId);
    if (!user) {
      console.log('🆕 사용자가 존재하지 않아 자동 생성:', userId);
      user = await UserModel.create(userId, `User_${userId}`);
      console.log('✅ 사용자 자동 생성 완료:', user.id);
    }
    
    // 분석 ID 찾기
    const analysis = await AnalysisModel.getBySession(sessionId);
    
    const feedback = await FeedbackModel.create(sessionId, user.id, {
      ...feedbackData,
      analysisId: analysis?.id
    });
    
    console.log('✅ Firestore 피드백 저장 완료');
    return { sessionUpdated: true, feedbackId: feedback.id };
  } catch (error) {
    console.error('❌ Firestore 피드백 저장 오류:', error);
    throw error;
  }
};

// 레시피 관련 API
export const saveImprovedRecipe = async (userId, sessionId, recipeData) => {
  try {
    console.log('🔥 Firestore 레시피 저장:', { userId, sessionId, recipeDataKeys: Object.keys(recipeData) });
    
    // 사용자 찾기 또는 자동 생성
    let user = await UserModel.findByPhone(userId);
    if (!user) {
      console.log('🆕 사용자가 존재하지 않아 자동 생성:', userId);
      user = await UserModel.create(userId, `User_${userId}`);
      console.log('✅ 사용자 자동 생성 완료:', user.id);
    }
    
    const recipe = await RecipeModel.create(sessionId, user.id, recipeData);
    
    console.log('✅ Firestore 레시피 저장 완료:', recipe.id);
    return { sessionUpdated: true, recipeId: recipe.id };
  } catch (error) {
    console.error('❌ Firestore 레시피 저장 오류:', error);
    throw error;
  }
};

export const getSessionRecipes = async (userId, sessionId) => {
  try {
    console.log('🔍 Firestore 세션 레시피 조회:', { userId, sessionId });
    
    const recipes = await RecipeModel.getBySession(sessionId);
    
    console.log(`✅ 세션 ${sessionId}의 레시피 ${recipes.length}개 조회 완료`);
    return recipes;
  } catch (error) {
    console.error('❌ Firestore 세션 레시피 조회 오류:', error);
    throw error;
  }
};

export const getRecipeById = async (userId, recipeId) => {
  try {
    const recipeDoc = await getDoc(doc(db, COLLECTIONS.RECIPES, recipeId));
    
    if (!recipeDoc.exists()) {
      throw new Error('레시피를 찾을 수 없습니다.');
    }
    
    return { id: recipeDoc.id, ...recipeDoc.data() };
  } catch (error) {
    console.error('❌ 레시피 상세 조회 오류:', error);
    throw error;
  }
};

export const setSessionActiveRecipe = async (userId, sessionId, recipeData) => {
  try {
    // 세션 상태 업데이트
    await SessionModel.updateStatus(sessionId, 'recipe_selected', {
      activeRecipeId: recipeData.id
    });
    
    console.log('✅ 세션의 활성 레시피 설정 완료');
    return { success: true, message: '이전 레시피가 활성화되었습니다.' };
  } catch (error) {
    console.error('❌ 활성 레시피 설정 오류:', error);
    throw error;
  }
};

export const toggleRecipeBookmark = async (userId, recipeId, isBookmarked) => {
  try {
    await RecipeModel.toggleBookmark(recipeId, isBookmarked);
    
    console.log(`✅ 레시피 북마크 ${isBookmarked ? '추가' : '제거'} 완료`);
    return { success: true, isBookmarked };
  } catch (error) {
    console.error('❌ 레시피 북마크 오류:', error);
    throw error;
  }
};

// 확정 관련 API
export const confirmPerfume = async (userId, sessionId, confirmationData) => {
  try {
    console.log('🔥 Firestore 향수 확정:', { userId, sessionId });
    
    // 사용자 찾기 또는 자동 생성
    let user = await UserModel.findByPhone(userId);
    if (!user) {
      console.log('🆕 사용자가 존재하지 않아 자동 생성:', userId);
      user = await UserModel.create(userId, `User_${userId}`);
      console.log('✅ 사용자 자동 생성 완료:', user.id);
    }
    
    const confirmation = await ConfirmationModel.create(sessionId, user.id, confirmationData);
    
    console.log('✅ Firestore 향수 확정 완료');
    return { sessionCompleted: true, confirmationId: confirmation.id };
  } catch (error) {
    console.error('❌ Firestore 향수 확정 오류:', error);
    throw error;
  }
};

// 관리자용 API - 최적화된 페이지네이션
export const getSessionsOptimized = async (page = 1, pageSize = 10, statusFilter = null) => {
  try {
    console.log(`🔍 Firestore 최적화된 세션 조회 - 페이지: ${page}, 사이즈: ${pageSize}`);
    
    // 페이지네이션을 위한 오프셋 계산
    const offset = (page - 1) * pageSize;
    let lastDoc = null;
    
    // 이전 페이지들을 건너뛰기 위한 처리 (실제로는 더 최적화 필요)
    if (offset > 0) {
      const skipQuery = query(
        collection(db, COLLECTIONS.SESSIONS),
        orderBy('updatedAt', 'desc'),
        limit(offset)
      );
      const skipSnapshot = await getDocs(skipQuery);
      if (!skipSnapshot.empty) {
        lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
      }
    }
    
    const result = await SessionModel.getAllPaginated(pageSize, lastDoc, statusFilter);
    
    // 총 세션 수 계산 (캐시 필요)
    const totalSessions = await getTotalSessionCount();
    const totalPages = Math.ceil(totalSessions / pageSize);
    
    console.log(`✅ Firestore 세션 조회 완료 - ${result.sessions.length}개 반환`);
    
    return {
      sessions: result.sessions,
      totalSessions,
      totalPages,
      currentPage: page,
      pageSize,
      hasMore: result.hasMore
    };
  } catch (error) {
    console.error('❌ Firestore 최적화된 세션 조회 오류:', error);
    throw error;
  }
};

// 전체 세션 수 캐시 (실제로는 Redis나 메모리 캐시 사용)
let totalSessionCountCache = { count: 0, timestamp: 0 };
const CACHE_DURATION = 5 * 1000; // 5초

const getTotalSessionCount = async () => {
  const now = Date.now();
  
  if (totalSessionCountCache.timestamp + CACHE_DURATION > now) {
    return totalSessionCountCache.count;
  }
  
  // 실제로는 Firestore에서 count 쿼리 사용 (Firebase 9 이상)
  const snapshot = await getDocs(collection(db, COLLECTIONS.SESSIONS));
  const count = snapshot.size;
  
  totalSessionCountCache = { count, timestamp: now };
  return count;
};

export const getAllUserDataPaginated = async (page = 1, pageSize = 10) => {
  // 하위 호환성을 위해 getSessionsOptimized 호출
  return await getSessionsOptimized(page, pageSize);
};

// 세션 전체 데이터 조회 (관리자용)
export const getSessionFullData = async (userId, sessionId) => {
  try {
    console.log(`🔍 Firestore 세션 전체 데이터 조회: ${userId}/${sessionId}`);
    
    // 세션 기본 정보
    const sessionDoc = await getDoc(doc(db, COLLECTIONS.SESSIONS, sessionId));
    if (!sessionDoc.exists()) {
      throw new Error('세션을 찾을 수 없습니다.');
    }
    
    const session = { id: sessionDoc.id, ...sessionDoc.data() };
    
    // 관련 데이터 병렬 로딩
    const [analysis, recipes, feedbacks, confirmations] = await Promise.all([
      AnalysisModel.getBySession(sessionId),
      RecipeModel.getBySession(sessionId),
      getFeedbacksBySession(sessionId),
      getConfirmationsBySession(sessionId)
    ]);
    
    // 매칭된 향수 데이터 로딩 (필요시)
    let matchingPerfumes = [];
    if (analysis && analysis.matchingPerfumeIds) {
      matchingPerfumes = await PerfumeModel.getByIds(analysis.matchingPerfumeIds);
    }
    
    const result = {
      session,
      analyses: analysis ? [analysis] : [],
      feedbacks: feedbacks || [],
      recipes: recipes || [],
      confirmed: confirmations || [],
      matchingPerfumes
    };
    
    console.log('✅ Firestore 세션 전체 데이터 조회 완료');
    return result;
  } catch (error) {
    console.error('❌ Firestore 세션 전체 데이터 조회 오류:', error);
    throw error;
  }
};

// 헬퍼 함수들
const getFeedbacksBySession = async (sessionId) => {
  const q = query(
    collection(db, COLLECTIONS.FEEDBACKS),
    where('sessionId', '==', sessionId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getConfirmationsBySession = async (sessionId) => {
  const q = query(
    collection(db, COLLECTIONS.CONFIRMATIONS),
    where('sessionId', '==', sessionId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 데이터 마이그레이션 API
export const migrateFromRealtimeDB = async () => {
  try {
    console.log('🔄 Realtime DB에서 Firestore로 마이그레이션 시작');
    
    // 기존 Realtime DB에서 데이터 읽기
    const { getAllUserData } = await import('./firebaseApi');
    const realtimeData = await getAllUserData();
    
    console.log('📊 마이그레이션할 데이터 크기:', Object.keys(realtimeData).length, '명의 사용자');
    
    // 배치로 마이그레이션 실행
    const results = await BatchOperations.migrateUserData(realtimeData);
    
    console.log('✅ 마이그레이션 완료:', results);
    return results;
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
    throw error;
  }
};

// 성능 모니터링 API
export const getPerformanceStats = async () => {
  try {
    const stats = {
      totalUsers: await getTotalCount(COLLECTIONS.USERS),
      totalSessions: await getTotalCount(COLLECTIONS.SESSIONS),
      totalAnalyses: await getTotalCount(COLLECTIONS.ANALYSES),
      totalRecipes: await getTotalCount(COLLECTIONS.RECIPES),
      activeSessions: await getActiveSessionCount(),
      recentActivity: await getRecentActivity()
    };
    
    return stats;
  } catch (error) {
    console.error('❌ 성능 통계 조회 오류:', error);
    throw error;
  }
};

const getTotalCount = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.size;
};

const getActiveSessionCount = async () => {
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where('status', '!=', 'confirmed')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
};

const getRecentActivity = async () => {
  const oneDayAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  
  const q = query(
    collection(db, COLLECTIONS.SESSIONS),
    where('updatedAt', '>=', oneDayAgo),
    orderBy('updatedAt', 'desc'),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};