#!/usr/bin/env node

/**
 * Realtime Database → Firestore 마이그레이션 스크립트
 * 
 * 사용법:
 * node scripts/migrateToFirestore.js [options]
 * 
 * 옵션:
 * --dry-run: 실제 마이그레이션 없이 미리보기만
 * --batch-size: 배치 크기 (기본값: 500)
 * --backup: 마이그레이션 전 백업 생성
 */

const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');

// Firebase 설정
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch, 
  Timestamp 
} = require('firebase/firestore');

// 환경 변수 로드
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

class FirestoreMigrator {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      batchSize: options.batchSize || 500,
      backup: options.backup || false,
      ...options
    };
    
    this.stats = {
      users: 0,
      sessions: 0,
      analyses: 0,
      recipes: 0,
      confirmations: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    this.initializeFirebase();
  }

  initializeFirebase() {
    if (!getApps().length) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = getApps()[0];
    }
    
    this.realtimeDb = getDatabase(this.app);
    this.firestore = getFirestore(this.app);
    
    console.log('🔥 Firebase 초기화 완료');
  }

  async migrate() {
    try {
      console.log('🚀 Firestore 마이그레이션 시작');
      console.log('설정:', this.options);
      
      // 1. 백업 생성 (옵션)
      if (this.options.backup) {
        await this.createBackup();
      }
      
      // 2. Realtime DB 데이터 읽기
      console.log('📖 Realtime Database 데이터 읽기...');
      const realtimeData = await this.readRealtimeData();
      
      if (!realtimeData || Object.keys(realtimeData).length === 0) {
        console.log('⚠️  마이그레이션할 데이터가 없습니다.');
        return;
      }
      
      console.log(`📊 발견된 사용자: ${Object.keys(realtimeData).length}명`);
      
      // 3. 데이터 구조 분석
      await this.analyzeData(realtimeData);
      
      // 4. Dry run 체크
      if (this.options.dryRun) {
        console.log('🔍 DRY RUN 모드 - 실제 마이그레이션은 수행하지 않습니다.');
        this.printStats();
        return;
      }
      
      // 5. 실제 마이그레이션 실행
      await this.performMigration(realtimeData);
      
      // 6. 결과 출력
      this.printStats();
      
      console.log('✅ 마이그레이션 완료!');
      
    } catch (error) {
      console.error('❌ 마이그레이션 오류:', error);
      throw error;
    }
  }

  async createBackup() {
    try {
      console.log('💾 백업 생성 중...');
      
      const usersRef = ref(this.realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const backupData = snapshot.val();
        const backupPath = path.join(__dirname, `../backups/realtime-backup-${Date.now()}.json`);
        
        // 백업 디렉토리 생성
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        
        // 백업 파일 저장
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ 백업 완료: ${backupPath}`);
      } else {
        console.log('⚠️  백업할 데이터가 없습니다.');
      }
    } catch (error) {
      console.error('❌ 백업 생성 오류:', error);
      throw error;
    }
  }

  async readRealtimeData() {
    try {
      const usersRef = ref(this.realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (error) {
      console.error('❌ Realtime DB 읽기 오류:', error);
      throw error;
    }
  }

  async analyzeData(realtimeData) {
    console.log('🔍 데이터 구조 분석 중...');
    
    for (const [userId, userData] of Object.entries(realtimeData)) {
      this.stats.users++;
      
      if (userData.perfumeSessions) {
        const sessions = Object.keys(userData.perfumeSessions);
        this.stats.sessions += sessions.length;
        
        for (const sessionId of sessions) {
          const session = userData.perfumeSessions[sessionId];
          
          if (session.imageAnalysis) {
            this.stats.analyses++;
          }
          
          if (session.improvedRecipe) {
            this.stats.recipes++;
          }
          
          if (session.confirmation) {
            this.stats.confirmations++;
          }
        }
      }
    }
    
    console.log('📊 분석 결과:');
    console.log(`  사용자: ${this.stats.users}명`);
    console.log(`  세션: ${this.stats.sessions}개`);
    console.log(`  분석: ${this.stats.analyses}개`);
    console.log(`  레시피: ${this.stats.recipes}개`);
    console.log(`  확정: ${this.stats.confirmations}개`);
  }

  async performMigration(realtimeData) {
    console.log('🔄 Firestore 마이그레이션 실행 중...');
    
    const userEntries = Object.entries(realtimeData);
    const totalBatches = Math.ceil(userEntries.length / this.options.batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * this.options.batchSize;
      const end = Math.min(start + this.options.batchSize, userEntries.length);
      const batch = userEntries.slice(start, end);
      
      console.log(`📦 배치 ${i + 1}/${totalBatches} 처리 중... (${start + 1}-${end})`);
      
      await this.migrateBatch(batch);
      
      // 진행률 표시
      const progress = Math.round(((i + 1) / totalBatches) * 100);
      console.log(`⏳ 진행률: ${progress}%`);
    }
  }

  async migrateBatch(userBatch) {
    const batch = writeBatch(this.firestore);
    const operations = [];
    
    for (const [userId, userData] of userBatch) {
      try {
        // 사용자 생성
        const userRef = doc(collection(this.firestore, 'users'));
        const userDoc = {
          phoneNumber: userId,
          customerName: this.extractCustomerName(userData),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          totalSessions: userData.perfumeSessions ? Object.keys(userData.perfumeSessions).length : 0
        };
        batch.set(userRef, userDoc);
        operations.push({ type: 'user', id: userRef.id });
        
        // 세션 마이그레이션
        if (userData.perfumeSessions) {
          for (const [sessionId, sessionData] of Object.entries(userData.perfumeSessions)) {
            const sessionRef = doc(collection(this.firestore, 'sessions'));
            const sessionDoc = this.transformSession(sessionData, userRef.id, userId);
            batch.set(sessionRef, sessionDoc);
            operations.push({ type: 'session', id: sessionRef.id, originalId: sessionId });
            
            // 분석 데이터 마이그레이션
            if (sessionData.imageAnalysis) {
              const analysisRef = doc(collection(this.firestore, 'analyses'));
              const analysisDoc = this.transformAnalysis(sessionData.imageAnalysis, sessionRef.id, userRef.id);
              batch.set(analysisRef, analysisDoc);
              operations.push({ type: 'analysis', id: analysisRef.id });
            }
            
            // 레시피 마이그레이션
            if (sessionData.improvedRecipe) {
              const recipeRef = doc(collection(this.firestore, 'recipes'));
              const recipeDoc = this.transformRecipe(sessionData.improvedRecipe, sessionRef.id, userRef.id);
              batch.set(recipeRef, recipeDoc);
              operations.push({ type: 'recipe', id: recipeRef.id });
            }
            
            // 확정 마이그레이션
            if (sessionData.confirmation) {
              const confirmRef = doc(collection(this.firestore, 'confirmations'));
              const confirmDoc = this.transformConfirmation(sessionData.confirmation, sessionRef.id, userRef.id);
              batch.set(confirmRef, confirmDoc);
              operations.push({ type: 'confirmation', id: confirmRef.id });
            }
          }
        }
        
      } catch (error) {
        console.error(`❌ 사용자 ${userId} 마이그레이션 오류:`, error);
        this.stats.errors++;
      }
    }
    
    try {
      await batch.commit();
      console.log(`✅ 배치 커밋 완료 (${operations.length}개 문서)`);
    } catch (error) {
      console.error('❌ 배치 커밋 오류:', error);
      this.stats.errors += operations.length;
    }
  }

  extractCustomerName(userData) {
    if (userData.perfumeSessions) {
      const firstSession = Object.values(userData.perfumeSessions)[0];
      return firstSession?.customerName || '알 수 없음';
    }
    return '알 수 없음';
  }

  transformSession(sessionData, userId, phoneNumber) {
    return {
      userId: userId,
      phoneNumber: phoneNumber,
      customerName: sessionData.customerName || '알 수 없음',
      status: sessionData.status || 'started',
      currentStep: this.calculateCurrentStep(sessionData),
      imageUrl: sessionData.imageUrl || null,
      hasImageAnalysis: !!sessionData.imageAnalysis,
      hasFeedback: !!sessionData.feedback,
      hasRecipe: !!sessionData.improvedRecipe,
      hasConfirmation: !!sessionData.confirmation,
      createdAt: this.convertTimestamp(sessionData.createdAt),
      updatedAt: this.convertTimestamp(sessionData.updatedAt),
      completedAt: sessionData.completedAt ? this.convertTimestamp(sessionData.completedAt) : null
    };
  }

  transformAnalysis(analysisData, sessionId, userId) {
    return {
      sessionId: sessionId,
      userId: userId,
      imageUrl: analysisData.imageUrl || '',
      idolInfo: {
        name: analysisData.name || '',
        gender: analysisData.gender || '',
        style: analysisData.style || [],
        personality: analysisData.personality || [],
        charms: analysisData.charms || ''
      },
      traits: analysisData.traits || {},
      scentCategories: analysisData.scentCategories || {},
      matchingKeywords: analysisData.matchingKeywords || [],
      personalColor: analysisData.personalColor || {},
      matchingPerfumeIds: this.extractPerfumeIds(analysisData.matchingPerfumes),
      primaryPerfumeId: this.extractPrimaryPerfumeId(analysisData.matchingPerfumes),
      analysisText: analysisData.analysis || '',
      confidenceScore: analysisData.confidenceScore || 0,
      createdAt: this.convertTimestamp(analysisData.timestamp)
    };
  }

  transformRecipe(recipeData, sessionId, userId) {
    return {
      sessionId: sessionId,
      userId: userId,
      basePerfumeId: recipeData.originalPerfumeId || '',
      customizations: recipeData.customizations || {},
      notes: recipeData.notes || {},
      characteristics: recipeData.characteristics || {},
      isBookmarked: recipeData.isBookmarked || false,
      bookmarkedAt: recipeData.bookmarkedAt ? this.convertTimestamp(recipeData.bookmarkedAt) : null,
      isActive: true,
      createdAt: this.convertTimestamp(recipeData.timestamp || recipeData.generatedAt),
      generatedAt: this.convertTimestamp(recipeData.generatedAt)
    };
  }

  transformConfirmation(confirmationData, sessionId, userId) {
    return {
      sessionId: sessionId,
      userId: userId,
      recipeId: confirmationData.recipeId || '',
      finalPerfumeId: confirmationData.finalPerfumeId || '',
      customizations: confirmationData.customizations || {},
      orderDetails: confirmationData.orderDetails || {},
      confirmedAt: this.convertTimestamp(confirmationData.confirmedAt),
      createdAt: this.convertTimestamp(confirmationData.timestamp)
    };
  }

  calculateCurrentStep(sessionData) {
    if (sessionData.confirmation) return 5;
    if (sessionData.improvedRecipe) return 4;
    if (sessionData.feedback) return 3;
    if (sessionData.imageAnalysis) return 2;
    return 1;
  }

  convertTimestamp(timestamp) {
    if (!timestamp) return Timestamp.now();
    
    if (typeof timestamp === 'object' && timestamp.seconds) {
      // Firebase Timestamp
      return Timestamp.fromMillis(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      return Timestamp.fromMillis(timestamp);
    } else if (typeof timestamp === 'string') {
      return Timestamp.fromDate(new Date(timestamp));
    }
    
    return Timestamp.now();
  }

  extractPerfumeIds(matchingPerfumes) {
    if (!matchingPerfumes || !Array.isArray(matchingPerfumes)) {
      return [];
    }
    
    // 실제로는 향수 이름을 기반으로 Firestore의 향수 ID를 찾아야 함
    // 여기서는 임시로 빈 배열 반환
    return [];
  }

  extractPrimaryPerfumeId(matchingPerfumes) {
    const ids = this.extractPerfumeIds(matchingPerfumes);
    return ids.length > 0 ? ids[0] : null;
  }

  printStats() {
    const duration = Date.now() - this.stats.startTime;
    const durationSec = Math.round(duration / 1000);
    
    console.log('\n📊 마이그레이션 결과:');
    console.log('='.repeat(50));
    console.log(`사용자: ${this.stats.users}명`);
    console.log(`세션: ${this.stats.sessions}개`);
    console.log(`분석: ${this.stats.analyses}개`);
    console.log(`레시피: ${this.stats.recipes}개`);
    console.log(`확정: ${this.stats.confirmations}개`);
    console.log(`오류: ${this.stats.errors}개`);
    console.log(`소요 시간: ${durationSec}초`);
    console.log('='.repeat(50));
  }
}

// CLI 설정
program
  .name('migrate-to-firestore')
  .description('Realtime Database에서 Firestore로 데이터 마이그레이션')
  .version('1.0.0')
  .option('--dry-run', '실제 마이그레이션 없이 미리보기만')
  .option('--batch-size <size>', '배치 크기', '500')
  .option('--backup', '마이그레이션 전 백업 생성')
  .action(async (options) => {
    try {
      const migrator = new FirestoreMigrator({
        dryRun: options.dryRun,
        batchSize: parseInt(options.batchSize),
        backup: options.backup
      });
      
      await migrator.migrate();
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      process.exit(1);
    }
  });

// 스크립트 실행
if (require.main === module) {
  program.parse();
}