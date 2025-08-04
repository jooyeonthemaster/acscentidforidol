// Firebase 연결 테스트 파일
import { db } from './firestore.js';
import { ref, set, serverTimestamp } from 'firebase/database';

export const testFirebaseConnection = async () => {
  try {
    console.log('Firebase 연결 테스트 시작...');
    
    // 테스트 데이터 작성
    const testRef = ref(db, 'test/connection');
    await set(testRef, {
      message: 'Firebase 연결 테스트 성공!',
      timestamp: serverTimestamp(),
      testTime: new Date().toISOString()
    });
    
    console.log('✅ Firebase 연결 테스트 성공!');
    return { success: true, message: 'Firebase 연결 성공' };
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    return { success: false, error: error.message };
  }
};