import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db, COLLECTIONS, FIELDS } from './firestore';

/**
 * Firestore 데이터 모델 정의
 * 성능 최적화와 비용 절약을 위한 정규화된 구조
 */

// 사용자 모델
export class UserModel {
  constructor(data = {}) {
    this.phoneNumber = data.phoneNumber || '';
    this.customerName = data.customerName || '';
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.lastActiveAt = data.lastActiveAt || Timestamp.now();
    this.totalSessions = data.totalSessions || 0;
  }

  static async create(phoneNumber, customerName) {
    const userData = {
      phoneNumber, 
      customerName,
      totalSessions: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastActiveAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), userData);
    return { id: docRef.id, ...userData };
  }

  static async findByPhone(phoneNumber) {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('phoneNumber', '==', phoneNumber),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async updateLastActive(userId) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      lastActiveAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }
}

// 세션 모델 - 메타데이터만 저장
export class SessionModel {
  constructor(data = {}) {
    this.userId = data.userId || '';
    this.phoneNumber = data.phoneNumber || '';
    this.customerName = data.customerName || '';
    this.status = data.status || 'started'; // started, image_analyzed, feedback_given, recipe_created, confirmed
    this.currentStep = data.currentStep || 1;
    this.imageUrl = data.imageUrl || null;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.completedAt = data.completedAt || null;
    
    // 진행 상황 추적
    this.hasImageAnalysis = data.hasImageAnalysis || false;
    this.hasFeedback = data.hasFeedback || false;
    this.hasRecipe = data.hasRecipe || false;
    this.hasConfirmation = data.hasConfirmation || false;
  }

  static async create(userId, phoneNumber, customerName) {
    const sessionData = {
      userId, 
      phoneNumber, 
      customerName,
      status: 'created',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), sessionData);
    
    // 사용자의 총 세션 수 증가
    await UserModel.incrementSessionCount(userId);
    
    return { id: docRef.id, ...sessionData };
  }

  static async updateStatus(sessionId, status, additionalData = {}) {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    const updateData = {
      status,
      updatedAt: Timestamp.now(),
      ...additionalData
    };

    // 상태에 따른 플래그 업데이트
    switch (status) {
      case 'image_analyzed':
        updateData.hasImageAnalysis = true;
        updateData.currentStep = 2;
        break;
      case 'feedback_given':
        updateData.hasFeedback = true;
        updateData.currentStep = 3;
        break;
      case 'recipe_created':
        updateData.hasRecipe = true;
        updateData.currentStep = 4;
        break;
      case 'confirmed':
        updateData.hasConfirmation = true;
        updateData.completedAt = Timestamp.now();
        updateData.currentStep = 5;
        break;
    }

    await updateDoc(sessionRef, updateData);
    return updateData;
  }

  static async getByUser(userId, pageSize = 10, lastDoc = null) {
    let q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    return {
      sessions: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  }

  // 관리자용 페이지네이션 - 기존 구조 호환
  static async getAllPaginated(pageSize = 10, lastDoc = null, statusFilter = null) {
    let q = query(
      collection(db, COLLECTIONS.SESSIONS),
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    );

    if (statusFilter && statusFilter !== 'all') {
      q = query(
        collection(db, COLLECTIONS.SESSIONS),
        where('status', '==', statusFilter),
        orderBy('updatedAt', 'desc'),
        limit(pageSize)
      );
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    // 기존 구조와 완전 호환되도록 변환
    const sessions = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        userId: data.userId || data.phoneNumber || 'unknown',
        sessionId: doc.id,
        phoneNumber: data.phoneNumber || data.userId || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : data.updatedAt,
        status: data.status || 'unknown',
        customerName: data.customerName || '알 수 없음',
        idolName: data.idolName || '분석 중',
        hasImageAnalysis: !!(data.analysisId || data.imageAnalysis),
        hasFeedback: !!data.feedbackId,
        hasRecipe: !!data.recipeId,
        hasConfirmation: !!data.confirmationId,
        completionStatus: (() => {
          if (data.confirmationId) return '완료';
          if (data.recipeId) return '레시피 생성';
          if (data.feedbackId) return '피드백 완료';
          if (data.analysisId || data.imageAnalysis) return '분석 완료';
          return '진행 중';
        })()
      };
    });
    
    return {
      sessions,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize
    };
  }
}

// 이미지 분석 모델
export class AnalysisModel {
  constructor(data = {}) {
    this.sessionId = data.sessionId || '';
    this.userId = data.userId || '';
    this.imageUrl = data.imageUrl || '';
    
    // 분석 결과 - 정규화된 구조
    this.idolInfo = {
      name: data.idolInfo?.name || '',
      gender: data.idolInfo?.gender || '',
      style: data.idolInfo?.style || [],
      personality: data.idolInfo?.personality || [],
      charms: data.idolInfo?.charms || ''
    };
    
    this.traits = data.traits || {};
    this.scentCategories = data.scentCategories || {};
    this.matchingKeywords = data.matchingKeywords || [];
    this.personalColor = data.personalColor || {};
    
    // 매칭된 향수는 ID만 참조 (정규화)
    this.matchingPerfumeIds = data.matchingPerfumeIds || [];
    this.primaryPerfumeId = data.primaryPerfumeId || null;
    
    this.analysisText = data.analysisText || '';
    this.confidenceScore = data.confidenceScore || 0;
    
    this.createdAt = data.createdAt || Timestamp.now();
  }

  static async create(sessionId, userId, analysisData) {
    const analysis = {
      sessionId,
      userId,
      ...analysisData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.ANALYSES), analysis);
    
    // 세션 상태 업데이트
    await SessionModel.updateStatus(sessionId, 'image_analyzed', {
      imageUrl: analysisData.imageUrl
    });
    
    return { id: docRef.id, ...analysis };
  }

  static async getBySession(sessionId) {
    if (!sessionId) {
      console.warn('⚠️ AnalysisModel.getBySession: sessionId가 없습니다');
      return null;
    }
    
    const q = query(
      collection(db, COLLECTIONS.ANALYSES),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

// 향수 모델 - 마스터 데이터
export class PerfumeModel {
  constructor(data = {}) {
    this.name = data.name || '';
    this.brand = data.brand || '';
    this.category = data.category || '';
    this.description = data.description || '';
    
    this.notes = {
      top: data.notes?.top || [],
      middle: data.notes?.middle || [],
      base: data.notes?.base || []
    };
    
    this.characteristics = data.characteristics || {};
    this.persona = data.persona || {};
    this.season = data.season || [];
    this.timeOfDay = data.timeOfDay || [];
    
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  static async getByIds(perfumeIds) {
    if (!perfumeIds || perfumeIds.length === 0) return [];
    
    const perfumes = [];
    const batchSize = 10; // Firestore in 쿼리 제한
    
    for (let i = 0; i < perfumeIds.length; i += batchSize) {
      const batch = perfumeIds.slice(i, i + batchSize);
      const q = query(
        collection(db, COLLECTIONS.PERFUMES),
        where('__name__', 'in', batch)
      );
      
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        perfumes.push({ id: doc.id, ...doc.data() });
      });
    }
    
    return perfumes;
  }

  static async search(characteristics, limit = 5) {
    // 특성 기반 향수 검색 로직
    // 실제로는 더 복잡한 매칭 알고리즘 필요
    const q = query(
      collection(db, COLLECTIONS.PERFUMES),
      where('isActive', '==', true),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

// 피드백 모델
export class FeedbackModel {
  constructor(data = {}) {
    this.sessionId = data.sessionId || '';
    this.userId = data.userId || '';
    this.analysisId = data.analysisId || '';
    
    this.ratings = data.ratings || {};
    this.selectedCategories = data.selectedCategories || [];
    this.improvements = data.improvements || {};
    this.comments = data.comments || '';
    
    this.createdAt = data.createdAt || Timestamp.now();
  }

  static async create(sessionId, userId, feedbackData) {
    const feedback = {
      sessionId,
      userId,
      ...feedbackData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACKS), feedback);
    
    // 세션 상태 업데이트
    await SessionModel.updateStatus(sessionId, 'feedback_given');
    
    return { id: docRef.id, ...feedback };
  }
}

// 레시피 모델
export class RecipeModel {
  constructor(data = {}) {
    this.sessionId = data.sessionId || '';
    this.userId = data.userId || '';
    this.feedbackId = data.feedbackId || '';
    
    this.basePerfumeId = data.basePerfumeId || '';
    this.customizations = data.customizations || {};
    this.notes = data.notes || {};
    this.characteristics = data.characteristics || {};
    
    this.isBookmarked = data.isBookmarked || false;
    this.bookmarkedAt = data.bookmarkedAt || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    
    this.createdAt = data.createdAt || Timestamp.now();
    this.generatedAt = data.generatedAt || Timestamp.now();
  }

  static async create(sessionId, userId, recipeData) {
    const recipe = {
      sessionId,
      userId,
      ...recipeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.RECIPES), recipe);
    
    // 세션 상태 업데이트
    await SessionModel.updateStatus(sessionId, 'recipe_created');
    
    return { id: docRef.id, ...recipe };
  }

  static async getBySession(sessionId) {
    if (!sessionId) {
      console.warn('⚠️ RecipeModel.getBySession: sessionId가 없습니다');
      return [];
    }
    
    try {
      // 단순 쿼리로 변경 (복합 인덱스 에러 방지)
      const q = query(
        collection(db, COLLECTIONS.RECIPES),
        where('sessionId', '==', sessionId)
      );
      
      const snapshot = await getDocs(q);
      
      // 클라이언트 측에서 필터링 및 정렬
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(recipe => recipe.isActive !== false) // isActive가 false가 아닌 것만
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bTime - aTime; // 최신순
        });
    } catch (error) {
      console.error('❌ RecipeModel.getBySession 오류:', error);
      return [];
    }
  }

  static async toggleBookmark(recipeId, isBookmarked) {
    const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
    await updateDoc(recipeRef, {
      isBookmarked,
      bookmarkedAt: isBookmarked ? Timestamp.now() : null,
      updatedAt: Timestamp.now()
    });
  }
}

// 확정 모델
export class ConfirmationModel {
  constructor(data = {}) {
    this.sessionId = data.sessionId || '';
    this.userId = data.userId || '';
    this.recipeId = data.recipeId || '';
    
    this.finalPerfumeId = data.finalPerfumeId || '';
    this.customizations = data.customizations || {};
    this.orderDetails = data.orderDetails || {};
    
    this.confirmedAt = data.confirmedAt || Timestamp.now();
    this.createdAt = data.createdAt || Timestamp.now();
  }

  static async create(sessionId, userId, confirmationData) {
    const confirmation = {
      sessionId,
      userId,
      ...confirmationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CONFIRMATIONS), confirmation);
    
    // 세션 완료 처리
    await SessionModel.updateStatus(sessionId, 'confirmed');
    
    return { id: docRef.id, ...confirmation };
  }
}

// 배치 작업 유틸리티
export class BatchOperations {
  static async migrateUserData(realtimeData) {
    const batch = writeBatch(db);
    const results = {
      users: 0,
      sessions: 0,
      analyses: 0,
      recipes: 0,
      confirmations: 0
    };

    for (const [userId, userData] of Object.entries(realtimeData)) {
      // 사용자 생성
      const userRef = doc(collection(db, COLLECTIONS.USERS));
      const user = new UserModel({
        phoneNumber: userId,
        customerName: userData.perfumeSessions ? 
          Object.values(userData.perfumeSessions)[0]?.customerName || '알 수 없음' : '알 수 없음'
      });
      batch.set(userRef, user);
      results.users++;

      // 세션 마이그레이션
      if (userData.perfumeSessions) {
        for (const [sessionId, sessionData] of Object.entries(userData.perfumeSessions)) {
          const sessionRef = doc(collection(db, COLLECTIONS.SESSIONS));
          const session = new SessionModel({
            userId: userRef.id,
            phoneNumber: userId,
            customerName: sessionData.customerName || '알 수 없음',
            status: sessionData.status || 'started',
            imageUrl: sessionData.imageUrl,
            createdAt: sessionData.createdAt ? Timestamp.fromMillis(sessionData.createdAt) : Timestamp.now(),
            updatedAt: sessionData.updatedAt ? Timestamp.fromMillis(sessionData.updatedAt) : Timestamp.now(),
            hasImageAnalysis: !!sessionData.imageAnalysis,
            hasFeedback: !!sessionData.feedback,
            hasRecipe: !!sessionData.improvedRecipe,
            hasConfirmation: !!sessionData.confirmation
          });
          batch.set(sessionRef, session);
          results.sessions++;

          // 분석 데이터 마이그레이션
          if (sessionData.imageAnalysis) {
            const analysisRef = doc(collection(db, COLLECTIONS.ANALYSES));
            const analysis = new AnalysisModel({
              sessionId: sessionRef.id,
              userId: userRef.id,
              imageUrl: sessionData.imageUrl,
              ...sessionData.imageAnalysis
            });
            batch.set(analysisRef, analysis);
            results.analyses++;
          }

          // 레시피 마이그레이션
          if (sessionData.improvedRecipe) {
            const recipeRef = doc(collection(db, COLLECTIONS.RECIPES));
            const recipe = new RecipeModel({
              sessionId: sessionRef.id,
              userId: userRef.id,
              ...sessionData.improvedRecipe
            });
            batch.set(recipeRef, recipe);
            results.recipes++;
          }

          // 확정 마이그레이션
          if (sessionData.confirmation) {
            const confirmRef = doc(collection(db, COLLECTIONS.CONFIRMATIONS));
            const confirmation = new ConfirmationModel({
              sessionId: sessionRef.id,
              userId: userRef.id,
              ...sessionData.confirmation
            });
            batch.set(confirmRef, confirmation);
            results.confirmations++;
          }
        }
      }
    }

    await batch.commit();
    return results;
  }
}

export {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
};